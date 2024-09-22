import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db'; 
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
}

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = 'luismiguel-empresa';

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
      return NextResponse.json({ error: 'ID do usuário não encontrado no token.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido.' }, { status: 400 });
    }

    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(uploadDirectory, fileName);

    await fs.mkdir(uploadDirectory, { recursive: true });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    const imageUrl = `/uploads/${fileName}`;

    // Atualizar o registro da empresa com o novo logo
    await query(
      'UPDATE empresas SET logo = ? WHERE id = ?',
      [imageUrl, userId]
    );

    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 });
  }
}
