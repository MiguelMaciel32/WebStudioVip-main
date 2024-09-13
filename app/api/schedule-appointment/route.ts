import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { empresa_id, user_id, data_hora, servico, nome, telefone } = await req.json();

    // Verifique se todos os campos necessários estão presentes
    if (!empresa_id || !user_id || !data_hora || !servico || !nome || !telefone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Simule o agendamento
    // Você deve substituir isso por sua lógica real de agendamento
    console.log({
      empresa_id,
      user_id,
      data_hora,
      servico,
      nome,
      telefone
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao agendar:', error);
    return NextResponse.json({ error: 'Erro ao agendar' }, { status: 500 });
  }
}