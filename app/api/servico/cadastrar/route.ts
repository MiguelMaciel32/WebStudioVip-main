import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'luismiguel-empresa'

export async function POST(request: Request) {
  const { nome, preco, duracao } = await request.json();
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!nome || !preco || !duracao) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const result = await query(
      'INSERT INTO servicos (empresa_id, nome, preco, duracao) VALUES (?, ?, ?, ?)', 
      [decoded.id, nome, preco, duracao]
    );
    return NextResponse.json({ message: 'Serviço cadastrado com sucesso.', result });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar serviço.' }, { status: 500 });
  }
}