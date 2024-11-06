export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel-empresa'; // Segredo JWT

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Consulta os serviços da empresa
    const result = await query('SELECT * FROM servicos WHERE empresa_id = ?', [decoded.id]);

    if (result.length === 0) {
      return NextResponse.json([], { status: 200 }); // Retorne uma lista vazia, em vez de erro 404
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}