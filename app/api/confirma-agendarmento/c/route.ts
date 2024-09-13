import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  const { telefone } = body;

  try {
    await query('UPDATE agendamentos SET status = "confirmado" WHERE telefone = ?', [telefone]);
    return NextResponse.json({ message: 'Agendamento confirmado com sucesso!' });
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao confirmar agendamento.' }, { status: 500 });
  }
}