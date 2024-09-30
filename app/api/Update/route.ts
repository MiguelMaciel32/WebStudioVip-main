import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { bucket } from '../../../lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

interface DecodedToken {
  id: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

export async function PUT(req: Request) {
  console.log('Recebida requisição PUT');

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
    return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
  }

  try {
    const { imageBase64 } = await req.json();
    console.log('Dados da requisição:', { imageBase64 });

    if (!imageBase64) {
      console.log('Imagem não fornecida.');
      return NextResponse.json({ error: 'Imagem não fornecida.' }, { status: 400 });
    }

    // Decodificar o token JWT para obter o ID do usuário
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token decodificado:', decoded);

    // Gerar um nome único para o arquivo
    const fileName = `profilePictures/${uuidv4()}.jpg`;

    // Fazer upload da imagem para o Firebase Storage
    const file = bucket.file(fileName);
    const buffer = Buffer.from(imageBase64, 'base64');

    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
      public: true, // Isso torna o arquivo publicamente acessível
    });

    // Gerar a URL pública da imagem
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('URL da imagem:', imageUrl);

    // Atualizar o banco de dados com a URL da imagem
    await query(
      'UPDATE empresas SET profile_picture_url = ? WHERE id = ?',
      [imageUrl, decoded.id]
    );
    console.log('Atualização realizada com sucesso.');

    return NextResponse.json({ message: 'Imagem enviada e URL salva com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem ou atualizar o banco de dados:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem ou atualizar o banco de dados.' }, { status: 500 });
  }
}
