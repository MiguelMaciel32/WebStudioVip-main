import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../../../lib/firebaseAdmin';
import { query, execute } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import vision from '@google-cloud/vision'; 

const client = new vision.ImageAnnotatorClient({
  keyFilename: '/Users/user/Documents/Web/vision/scadaiot-c8a2b-c3b35ad8ad84.json',  
});

interface DecodedToken {
  id: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: 'Token inválido ou usuário não encontrado.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido.' }, { status: 400 });
    }

    // Verificar o tamanho do arquivo
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'O arquivo é muito grande. O tamanho máximo permitido é 5 MB.' }, { status: 400 });
    }

    const fileName = `${uuidv4()}.jpg`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Verificando se a imagem contém conteúdo impróprio usando a Vision API
    const [result] = await client.safeSearchDetection(fileBuffer);
    const safeSearch = result.safeSearchAnnotation;

    if (safeSearch) {
      const { adult, violence, racy, spoof } = safeSearch;

      // Rejeita imagens com conteúdo impróprio
      if (adult === 'LIKELY' || adult === 'VERY_LIKELY' || 
          violence === 'LIKELY' || violence === 'VERY_LIKELY' ||
          racy === 'LIKELY' || racy === 'VERY_LIKELY' ||
          spoof === 'LIKELY' || spoof === 'VERY_LIKELY') {
        
        return NextResponse.json({
          error: 'A imagem contém conteúdo impróprio e não pode ser enviada.',
          toast: 'Imagem imprópria! Evite conteúdo adulto, violento ou sugestivo.'
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Erro na análise de segurança da imagem.' }, { status: 500 });
    }

    // Upload da imagem no Firebase Storage
    const fileUpload = bucket.file(fileName);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(null);
      });
      stream.on('error', (error) => {
        reject(new Error('Erro ao fazer upload para o Firebase Storage.'));
      });
      stream.end(fileBuffer);
    });

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    // Salvando a URL da imagem no banco de dados
    const updateResult = await execute('UPDATE empresas SET ambient_photo = ? WHERE id = ?', [imageUrl, userId]);
    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ error: 'Nenhuma linha foi atualizada.', status: 404 });
    }

    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.', status: 500 });
  }
}
