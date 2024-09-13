import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Confirmar pagamento e criar agendamento
export async function POST(req: Request) {
  const body = await req.json();
  const { empresa_id, user_id, data_hora, servico, nome, telefone } = body;

  // Criar o agendamento no banco de dados
  try {
    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)',
      [empresa_id, user_id, data_hora, servico, nome, telefone]
    );

    return NextResponse.json({ message: 'Agendamento confirmado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao confirmar o agendamento.' }, { status: 500 });
  }
}