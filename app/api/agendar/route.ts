import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel'; // Cliente só

export async function POST(req: NextRequest) {
  try {
    // Recebe e loga o corpo da requisição
    const body = await req.json();
    console.log('Corpo da requisição recebido:', body);

    // Extrai os dados da resposta do pagamento
    const { Payment, Status, MerchantOrder } = body;
    console.log('ID do pagamento:', Payment);
    console.log('Status do pagamento:', Status);
    console.log('ID do pedido do comerciante:', MerchantOrder);

    // Verifica se o pagamento foi aprovado
    if (Status !== 'approved') {
      return NextResponse.json({ error: 'Pagamento não aprovado.' }, { status: 400 });
    }

    // Aqui você deve obter os dados do agendamento com base no MerchantOrder
    // Vamos supor que você tenha uma forma de obter esses dados. Para este exemplo, vamos usar dados fictícios:
    const agendamentoData = {
      empresa_id: 1, // Isso deve vir de onde você armazenou os dados temporários
      data_hora: '2024-09-18T16:56:00',
      servico: 'Sobrancelha',
      nome: 'teste',
      telefone: '11948710683'
    };

    const { empresa_id, data_hora, servico, nome, telefone } = agendamentoData;

    // Verifica se todos os campos necessários estão presentes
    if (!empresa_id || !data_hora || !servico || !nome || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const agendamentoDataDate = new Date(data_hora);
    const dataAtual = new Date();

    if (agendamentoDataDate < dataAtual) {
      return NextResponse.json({ error: 'Não é possível agendar para uma data no passado.' }, { status: 400 });
    }

    // Verifica se o horário já está ocupado
    const existingAgendamento = await query(
      'SELECT * FROM agendamentos WHERE empresa_id = ? AND data_hora = ?',
      [empresa_id, data_hora]
    );

    if (existingAgendamento.length > 0) {
      return NextResponse.json({ error: 'Este horário já está ocupado.' }, { status: 409 });
    }

    // Insere o agendamento na tabela
    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)',
      [empresa_id, 1, data_hora, servico, nome, telefone] // Supondo user_id = 1, ajuste conforme necessário
    );

    return NextResponse.json({ message: 'Agendamento realizado com sucesso!', result }, { status: 201 });

  } catch (error) {
    console.error('Erro ao processar o feedback:', error);
    return NextResponse.json({ error: 'Erro ao processar o feedback.' }, { status: 500 });
  }
}
