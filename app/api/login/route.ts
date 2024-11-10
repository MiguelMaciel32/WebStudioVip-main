import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface User {
  id: number;
  username: string;
  password: string;
  profile_picture: string;
  name: string;
  cep: string;
}

const JWT_SECRET = 'luismiguel';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    const result = await query<User>('SELECT * FROM users WHERE username = ?', [username]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = result[0];

    const senhaCorreta = await bcrypt.compare(password, user.password); 

    if (senhaCorreta) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return NextResponse.json({
        message: 'Login bem-sucedido',
        profilePicture: user.profile_picture,
        name: user.name,
        cep: user.cep,
        token
      });
    } else {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro no servidor:', error.message);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    } else {
      console.error('Erro desconhecido no servidor');
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
  }
}
