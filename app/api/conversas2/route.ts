import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Helper para interagir com o banco de dados
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel';

export async function GET(request: NextRequest) {
  try {
    // Obter o agendamento_id da query string
    const agendamento_id = request.nextUrl.searchParams.get('agendamento_id');
    if (!agendamento_id) {
      return NextResponse.json({ error: 'agendamento_id é necessário.' }, { status: 400 });
    }

    // Verificar o cabeçalho de autorização para o token
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    // Extrair o token do cabeçalho
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Consultar as mensagens associadas ao agendamento_id
    const mensagens = await query(
      `SELECT id, agendamento_id, user_id, mensagem, data_hora
       FROM mensagens
       WHERE agendamento_id = ?
       ORDER BY data_hora ASC`,
      [agendamento_id]
    );

    if (mensagens.length === 0) {
      return NextResponse.json({ error: 'Nenhuma mensagem encontrada para o agendamento_id fornecido.' }, { status: 404 });
    }

    // Retornar as mensagens com sucesso
    return NextResponse.json({ messages: mensagens }, { status: 200 });

  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
    return NextResponse.json({ error: 'Erro ao carregar mensagens.' }, { status: 500 });
  }
}
