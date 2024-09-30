import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../../../lib/firebaseAdmin'; 
import { query } from '../../../lib/db'; 

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Arquivo ou ID do usuário não fornecido.' }, { status: 400 });
    }

    const fileName = `${uuidv4()}.png`; 
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

    await query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [imageUrl, userId]
    );

    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 });
  }
}
