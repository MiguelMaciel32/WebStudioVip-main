// app/api/conversas2/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel'; // Segredo específico para o cliente

export async function GET(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verificando e decodificando o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const clienteId = decoded.id;

    // Buscando os agendamentos do cliente
    const agendamentos = await query(`
      SELECT a.id, a.data_hora, a.servico, e.name as cliente, e.contact as email
      FROM agendamentos a
      JOIN users e ON a.user_id = e.id
      WHERE a.user_id = ?
    `, [clienteId]);

    return NextResponse.json(agendamentos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos.' }, { status: 500 });
  }
}
