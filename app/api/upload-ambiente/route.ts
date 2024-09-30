import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../../../lib/firebaseAdmin';
import { query, execute } from '../../../lib/db'; 
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    console.log('Cabeçalho de autorização:', authorizationHeader);

    if (!authorizationHeader) {
      console.log('Token de autorização não fornecido.');
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    console.log('Token extraído:', token);

    if (!token) {
      console.log('Token não encontrado no cabeçalho.');
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.', status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token decodificado:', decoded);

    const userId = decoded.id;
    if (!userId) {
      console.log('Token inválido ou usuário não encontrado.');
      return NextResponse.json({ error: 'Token inválido ou usuário não encontrado.', status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    console.log('Arquivo recebido:', file);

    if (!file) {
      console.log('Arquivo não fornecido.');
      return NextResponse.json({ error: 'Arquivo não fornecido.', status: 400 });
    }

    const fileName = `${uuidv4()}.jpg`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`Imagem ${fileName} carregada com sucesso no Firebase Storage.`);
        resolve(null);
      });
      stream.on('error', (error) => {
        console.error('Erro durante o upload para o Firebase Storage:', error);
        reject(new Error('Erro ao fazer upload para o Firebase Storage.'));
      });
      stream.end(fileBuffer); 
    });

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    console.log('URL da imagem:', imageUrl);

    const result = await execute('UPDATE empresas SET ambient_photo = ? WHERE id = ?', [imageUrl, userId]);
    console.log('Resultado da atualização:', result);

    if (result.affectedRows === 0) {
      console.error('Nenhuma linha foi atualizada. Verifique se o ID do usuário está correto.');
      return NextResponse.json({ error: 'Nenhuma linha foi atualizada.', status: 404 });
    }

    console.log(`Imagem salva no banco de dados com URL: ${imageUrl}`);
    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.', status: 500 });
  }
}
