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
  if (!authorizationHeader) {
    console.log('Token de autorização não fornecido.');
    return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    console.log('Token não encontrado no cabeçalho.');
    return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token decodificado:', decodedToken);

    const { about } = await req.json();
    const userId = decodedToken.id; // Fallback para usar o ID do token
    console.log('Dados recebidos:', { userId, about });

    if (!userId || typeof about !== 'string') {
      console.log('Dados inválidos:', { userId, about });
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Verificar se o registro já existe no banco
    const existingUser = await query('SELECT id FROM empresas WHERE id = ?', [userId]);

    if (existingUser.length > 0) {
      // Atualizar registro existente
      await query('UPDATE empresas SET sobre = ? WHERE id = ?', [about, userId]);
      console.log('Registro atualizado.');
    } 

    return NextResponse.json({ message: 'Operação concluída com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 500 });
  }
}
