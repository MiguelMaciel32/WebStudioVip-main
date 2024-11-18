import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Acesso negado. Token não fornecido.' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 403 });
    }

    const body = await req.json();
    const { empresaId, data_hora, servico, nome, telefone } = body;

    if (!empresaId || !data_hora || !servico || !nome || !telefone) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    const agendamentoData = new Date(data_hora);
    const dataAtual = new Date();

    if (agendamentoData < dataAtual) {
      return NextResponse.json({ error: 'Não é possível agendar para uma data no passado.' }, { status: 400 });
    }

    // Verificar se o usuário já tem um agendamento em outro salão no mesmo horário
    const agendamentoConflitante = await query(
      'SELECT * FROM agendamentos WHERE user_id = ? AND data_hora = ?',
      [userId, data_hora]
    );

    if (agendamentoConflitante.length > 0) {
      return NextResponse.json({ error: 'Você já tem um agendamento em outro salão neste horário.' }, { status: 409 });
    }

    // Verificar se o horário no salão específico já está ocupado
    const existingAgendamento = await query(
      'SELECT * FROM agendamentos WHERE empresa_id = ? AND data_hora = ?',
      [empresaId, data_hora]
    );

    if (existingAgendamento.length > 0) {
      return NextResponse.json({ error: 'Este horário já está ocupado.' }, { status: 409 });
    }

    // Inserir o novo agendamento
    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [empresaId, userId, data_hora, servico, nome, telefone, 'pendente']
    );

    return NextResponse.json({ message: 'Agendamento realizado com sucesso! Aguardando confirmação de pagamento.', result }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar o agendamento:', error);
    return NextResponse.json({ error: 'Erro ao processar o agendamento.' }, { status: 500 });
  }
}
