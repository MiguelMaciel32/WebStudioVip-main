import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

interface DecodedToken {
  id: number;
}

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = 'luismiguel-empresa';

export async function POST(req: NextRequest) {
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
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não fornecido ou inválido.' }, { status: 400 });
    }

    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(uploadDirectory, fileName);

    // Crie o diretório se não existir
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    // Converta o arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salve o arquivo no disco
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    await query(
      'UPDATE empresas SET ambient_photo = ? WHERE id = ?',
      [imageUrl, userId]
    );

    return NextResponse.json({ profilePicture: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 });
  }
}
