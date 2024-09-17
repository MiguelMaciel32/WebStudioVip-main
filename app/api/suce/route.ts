import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collection_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const paymentId = searchParams.get('payment_id');


    if (!collectionId || !status || !externalReference || !paymentId) {
      console.error('Parâmetros ausentes:', { collectionId, status, externalReference, paymentId });
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }


    let parsedReference;
    try {
      parsedReference = JSON.parse(decodeURIComponent(externalReference));
      console.log('Dados decodificados de external_reference:', parsedReference);
    } catch (error) {
      console.error('Erro ao processar external_reference:', error);
      return NextResponse.json({ error: 'Erro ao processar external_reference.' }, { status: 400 });
    }

    const { nome, telefone, data_hora, empresaId, userId } = parsedReference;


    console.log('Dados extraídos:', { nome, telefone, data_hora, empresaId,  userId });

    if (!nome || !telefone || !data_hora || !empresaId  || !userId) {
      console.error('Dados de referência externa inválidos:', { nome, telefone, data_hora, empresaId,  userId });
      return NextResponse.json({ error: 'Dados de referência externa inválidos.' }, { status: 400 });
    }

  
    const existingAgendamento = await query(
      'SELECT * FROM agendamentos WHERE payment_id = ?',
      [paymentId]
    );

    if (existingAgendamento.length > 0) {
      console.log('Agendamento já processado:', existingAgendamento);
      return NextResponse.json({ message: 'Agendamento já processado.' }, { status: 200 });
    }

  
    try {
      const result = await query(
        'INSERT INTO agendamentos (empresa_id, nome, telefone,  data_hora, payment_id, status, user_id) VALUES ( ?, ?, ?, ?, ?, ?, ?)',
        [empresaId, nome, telefone,  data_hora, paymentId, status, userId]
      );

      console.log('Agendamento inserido com sucesso:', result);
      return NextResponse.json({ message: 'Agendamento inserido com sucesso!', result }, { status: 201 });
    } catch (error) {
      console.error('Erro ao inserir o agendamento:', error);
      return NextResponse.json({ error: 'Erro ao inserir o agendamento.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 500 });
  }
}
