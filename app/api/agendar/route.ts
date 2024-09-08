import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; 


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { empresa_id, user_id, data_hora, servico, nome, telefone } = body;


    const agendamentoData = new Date(data_hora);
    const dataAtual = new Date();

    if (agendamentoData < dataAtual) {
      return NextResponse.json({ error: 'Não é possível agendar para uma data no passado.' }, { status: 400 });
    }

    const existingAgendamento = await query(
      'SELECT * FROM agendamentos WHERE empresa_id = ? AND data_hora = ?',
      [empresa_id, data_hora]
    );

    if (existingAgendamento.length > 0) {
      return NextResponse.json({ error: 'Este horário já está ocupado.' }, { status: 409 });
    }

    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)',
      [empresa_id, user_id, data_hora, servico, nome, telefone]
    );

    return NextResponse.json({ message: 'Agendamento realizado com sucesso!', result }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar o agendamento:', error);
    return NextResponse.json({ error: 'Erro ao processar o agendamento.' }, { status: 500 });
  }
}