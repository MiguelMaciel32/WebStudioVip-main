import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

interface ServicoComprado {
  id: number;
  data_hora: string;
  servico: string;
  nome: string; // Atualizado para refletir a coluna `nome`
  telefone: string; // Atualizado para refletir a coluna `telefone`
}

interface DecodedToken {
  id: number;
}

const JWT_SECRET = 'luismiguel';

export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader) {
    return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
  }

  const token = authorizationHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    const servicosComprados = await query<ServicoComprado[]>(`
      SELECT id, data_hora, servico, nome, telefone as empresa
      FROM agendamentos
      WHERE user_id = ?
      ORDER BY data_hora DESC
    `, [decoded.id]);

    return NextResponse.json(servicosComprados, { status: 200 });
    console.log(servicosComprados);
  } catch (error) {
    console.error('Erro ao verificar o token JWT ou executar a consulta:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    } else {
      return NextResponse.json({ error: 'Erro ao executar a consulta.' }, { status: 500 });
    }
  }
}
