import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const ambienteImages = formData.getAll('ambienteImages') as Blob[];
    
    if (!file && ambienteImages.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const fileName = file ? `${uuidv4()}.png` : '';
    const filePath = file ? path.join(uploadDirectory, fileName) : '';

    if (file) {
      await fs.mkdir(uploadDirectory, { recursive: true });
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);
    }

    const ambienteImageUrls = [];
    for (const ambienteImage of ambienteImages) {
      const ambienteImageName = `${uuidv4()}.png`;
      const ambienteImagePath = path.join(uploadDirectory, ambienteImageName);
      const ambienteImageBuffer = Buffer.from(await ambienteImage.arrayBuffer());
      await fs.writeFile(ambienteImagePath, ambienteImageBuffer);
      ambienteImageUrls.push(`/uploads/${ambienteImageName}`);
    }

    const imageUrl = file ? `/uploads/${fileName}` : '';
    await query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [imageUrl, 'userId'] // Certifique-se de substituir 'userId' pelo ID real do usuário
    );

    return NextResponse.json({ logo: imageUrl, ambienteImages: ambienteImageUrls }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 });
  }
}