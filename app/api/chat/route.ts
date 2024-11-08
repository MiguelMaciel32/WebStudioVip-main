import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agendamento_id = Number(searchParams.get('id'));

  if (!agendamento_id || isNaN(agendamento_id)) {
    return NextResponse.json({ error: 'O agendamento_id é necessário e deve ser um número.' }, { status: 400 });
  }

  try {
    // Obtenha informações do usuário associado ao agendamento
    const userResult = await query(`
      SELECT u.id, u.name, u.profile_picture 
      FROM users u
      JOIN agendamentos a ON u.id = a.user_id
      WHERE a.id = ?
    `, [agendamento_id]);

    if (!userResult.length) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const user = userResult[0];

    // Obtenha mensagens específicas para o agendamento
    const mensagens = await query(`
      SELECT m.id, m.mensagem, m.data_hora, m.user_id 
      FROM mensagens m
      WHERE m.agendamento_id = ?
      ORDER BY m.data_hora ASC
    `, [agendamento_id]);

    return NextResponse.json({ user, mensagens }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados do chat:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do chat.' }, { status: 500 });
  }
}
