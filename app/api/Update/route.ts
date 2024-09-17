import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

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
    const { descricao } = await req.json();
    console.log('Dados da requisição:', { descricao });

    if (!descricao) {
      console.log('Descrição não fornecida.');
      return NextResponse.json({ error: 'Descrição não fornecida.' }, { status: 400 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token decodificado:', decoded);

    await query(
      'UPDATE empresas SET sobre = ? WHERE id = ?',
      [descricao, decoded.id]
    );
    console.log('Atualização realizada com sucesso.');

    return NextResponse.json({ message: 'Informações da empresa atualizadas com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar informações da empresa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar informações da empresa.' }, { status: 500 });
  }
}
