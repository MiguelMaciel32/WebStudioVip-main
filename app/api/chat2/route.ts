
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel'; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agendamento_id = Number(searchParams.get('id'));

    if (!agendamento_id || isNaN(agendamento_id)) {
      return NextResponse.json({ error: 'O agendamento_id é necessário e deve ser um número.' }, { status: 400 });
    }

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

    // Obtendo as mensagens para o agendamento
    const user = await query(`
      SELECT id, name, profile_picture FROM users WHERE id = ?
    `, [clienteId]);

    const mensagens = await query(`
      SELECT m.id, m.mensagem, m.data_hora, m.user_id
      FROM mensagens m
      WHERE m.agendamento_id = ?
      ORDER BY m.data_hora ASC
    `, [agendamento_id]);

    if (!user.length) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user: user[0], mensagens }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados do chat:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do chat.' }, { status: 500 });
  }
}
