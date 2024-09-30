// /pages/api/upload.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db'; 

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: Request) {
  try {
    // Parse FormData do request
    const formData = await req.formData();

    // Adicionando log para verificar FormData
    console.log('FormData recebido:', Array.from(formData.entries()));

    const file = formData.get('file') as Blob | null;
    const userId = formData.get('userId') as string | null;

    // Verificação de arquivo e userId
    if (!file || !userId) {
      console.error('Arquivo ou ID do usuário ausente.');
      return NextResponse.json({ error: 'Arquivo ou ID do usuário não fornecido.' }, { status: 400 });
    }

    // Criação do nome do arquivo com UUID
    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(uploadDirectory, fileName);

    // Criando diretório de uploads se não existir
    await fs.mkdir(uploadDirectory, { recursive: true });

    // Convertendo Blob para Buffer e salvando no servidor
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Gerando URL da imagem e atualizando no banco de dados
    const imageUrl = `/uploads/${fileName}`;
    await query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [imageUrl, userId]
    );

    // Resposta de sucesso
    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 });
  }
}
