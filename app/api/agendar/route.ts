import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel'; // Cliente só

export async function POST(req: NextRequest) {
  try {
    // Handle token authentication
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

    // Handle agendamento logic
    const body = await req.json();
    const { empresa_id, data_hora, servico, nome, telefone } = body;

    if (!empresa_id || !data_hora || !servico || !nome || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

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

    // Create agendamento
    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)',
      [empresa_id, userId, data_hora, servico, nome, telefone]
    );

    return NextResponse.json({ message: 'Agendamento realizado com sucesso!', result }, { status: 201 });

  } catch (error) {
    console.error('Erro ao processar o agendamento:', error);
    return NextResponse.json({ error: 'Erro ao processar o agendamento.' }, { status: 500 });
  }
}
