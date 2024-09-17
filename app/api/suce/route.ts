import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Obtendo parâmetros da URL
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collection_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const paymentId = searchParams.get('payment_id');

    // Checando se os parâmetros são válidos
    if (!collectionId || !status || !externalReference || !paymentId) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // Decodificando o external_reference (JSON)
    let parsedReference;
    try {
      parsedReference = JSON.parse(externalReference);
    } catch (error) {
      return NextResponse.json({ error: 'Erro ao processar external_reference.' }, { status: 400 });
    }

    const { nome, telefone, data_hora, empresaId } = parsedReference;

    // Validando os dados extraídos
    if (!nome || !telefone || !data_hora || !empresaId) {
      return NextResponse.json({ error: 'Dados de referência externa inválidos.' }, { status: 400 });
    }

    // Inserindo o agendamento no banco de dados
    const servico = 'Sobrancelha';  // Exemplo, ajuste conforme necessário
    const precoServico = 10;  // Exemplo, ajuste conforme necessário

    try {
      const result = await query(
        'INSERT INTO agendamentos (empresa_id, nome, telefone, servico, preco_servico, data_hora, payment_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [empresaId, nome, telefone, servico, precoServico, data_hora, paymentId, 'aprovado']
      );

      return NextResponse.json({ message: 'Agendamento inserido com sucesso!', result }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Erro ao inserir o agendamento.' }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 500 });
  }
}