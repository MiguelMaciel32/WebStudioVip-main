import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Ajuste o caminho de acordo com sua estrutura de pastas

// Função que lida com o método GET para obter os agendamentos
export async function GET() {
  try {
    const agendamentos = await query(`
      SELECT a.id, a.data_hora, a.servico, u.name as cliente, u.contact as email
      FROM agendamentos a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.data_hora DESC
    `);

    return NextResponse.json(agendamentos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos.' }, { status: 500 });
  }
}