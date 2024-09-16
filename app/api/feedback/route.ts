import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel'; // Certifique-se de usar um segredo seguro

export async function POST(req: NextRequest) {
  try {
    console.log('Início da execução da função POST');

    // Obtém o token do cabeçalho de autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Token não encontrado ou formato inválido.');
      return NextResponse.json({ error: 'Token não encontrado ou formato inválido.' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' do início

    // Decodifica o token para obter o user_id
    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
      console.log('User ID extraído do token:', userId);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return NextResponse.json({ error: 'Erro ao processar o token.' }, { status: 401 });
    }

    // Recebe e loga o corpo da requisição
    const body = await req.json();
    console.log('Corpo da requisição recebido:', body);

    // Extrai os dados da resposta do pagamento
    const { collection_id, collection_status, payment_id, status, external_reference } = body;
    console.log('ID do pagamento:', payment_id);
    console.log('Status do pagamento:', status);
    console.log('ID do pedido do comerciante:', collection_id);

    // Verifica se o pagamento foi aprovado
    if (status !== 'approved') {
      console.log('Pagamento não aprovado.');
      return NextResponse.json({ error: 'Pagamento não aprovado.' }, { status: 400 });
    }

    // Processa external_reference
    let nome: string, telefone: string, dataHora: string, empresaId: number, servico: string, precoServico: number;
    try {
      if (external_reference) {
        const parsedReference = JSON.parse(external_reference);
        nome = parsedReference.nome;
        telefone = parsedReference.telefone;
        dataHora = parsedReference.data_hora;
        empresaId = parsedReference.empresaId;
        servico = parsedReference.servico;
        precoServico = parsedReference.precoServico;
      } else {
        console.error('external_reference está nulo.');
        return NextResponse.json({ error: 'Dados de referência externa ausentes.' }, { status: 400 });
      }
    } catch (error) {
      console.error('Erro ao deserializar external_reference:', error);
      return NextResponse.json({ error: 'Erro ao processar dados de referência externa.' }, { status: 400 });
    }

    console.log('Dados extraídos do external_reference:');
    console.log({ nome, telefone, dataHora, empresaId, servico, precoServico });

    // Verifica se todos os campos necessários estão presentes
    if (!empresaId || !dataHora || !nome || !telefone || !servico || !precoServico) {
      console.log('Campos obrigatórios ausentes.');
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Verifica se a data e hora do agendamento são válidas
    const agendamentoDataDate = new Date(dataHora);
    const dataAtual = new Date();

    if (agendamentoDataDate < dataAtual) {
      console.log('Data do agendamento está no passado.');
      return NextResponse.json({ error: 'Não é possível agendar para uma data no passado.' }, { status: 400 });
    }

    // Verifica se o horário já está ocupado
    console.log('Verificando se o horário já está ocupado...');
    const existingAgendamento = await query(
      'SELECT * FROM agendamentos WHERE empresa_id = ? AND data_hora = ?',
      [empresaId, dataHora]
    );

    console.log('Resultado da verificação de agendamentos existentes:', existingAgendamento);

    if (existingAgendamento.length > 0) {
      console.log('Este horário já está ocupado.');
      return NextResponse.json({ error: 'Este horário já está ocupado.' }, { status: 409 });
    }

    // Insere o agendamento na tabela
    console.log('Inserindo agendamento...');
    const result = await query(
      'INSERT INTO agendamentos (empresa_id, user_id, data_hora, servico, nome, telefone, preco_servico, payment_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresaId, userId, dataHora, servico, nome, telefone, precoServico, payment_id, 'pendente'] // O status é definido como 'pendente' por padrão
    );

    console.log('Agendamento inserido com sucesso. Dados do agendamento:');
    console.log({
      empresa_id: empresaId,
      data_hora: dataHora,
      servico,
      nome,
      telefone,
      preco_servico: precoServico,
      payment_id
    });

    return NextResponse.json({ message: 'Agendamento realizado com sucesso!', result }, { status: 201 });

  } catch (error) {
    console.error('Erro ao processar o feedback:', error);
    return NextResponse.json({ error: 'Erro ao processar o feedback.' }, { status: 500 });
  }
}
