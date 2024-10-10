// api/chat.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agendamento_id = Number(searchParams.get('id'));

  if (!agendamento_id || isNaN(agendamento_id)) {
    return NextResponse.json({ error: 'O agendamento_id é necessário e deve ser um número.' }, { status: 400 });
  }

  try {
    // Obtenha informações do usuário e mensagens
    const user = await query(`
      SELECT id, name, profile_picture FROM users WHERE id = (
        SELECT user_id FROM agendamentos WHERE id = ?
      )`, [agendamento_id]);

    const mensagens = await query(`
         SELECT a.id, a.data_hora, a.servico, u.name as cliente, u.contact as email
      FROM agendamentos a
      JOIN users u ON a.user_id = u.id
      WHERE a.empresa_id = ?
      ORDER BY a.data_hora DESC`, [agendamento_id]);

    if (!user.length) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user: user[0], mensagens }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados do chat:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do chat.' }, { status: 500 });
  }
}
