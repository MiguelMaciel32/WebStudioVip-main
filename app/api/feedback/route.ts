import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN2 || '', 
});

type Data = {
  id?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Extrair os detalhes do agendamento do corpo da requisição
    const { description, price, quantity, empresaId, servico, data_hora, nome, telefone } = await req.json();

    // Validar os campos necessários
    if (!description || !price || !quantity || !empresaId || !servico || !data_hora || !nome || !telefone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Configurar a preferência de pagamento
    const preference = {
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Math.floor(Number(quantity)), // Garantir que a quantidade seja um inteiro
        },
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/api/statuspagamento?pagamento_id=${Date.now()}&status=approved`,
        failure: `${req.headers.get('origin')}/api/statuspagamento?pagamento_id=${Date.now()}&status=rejected`,
        pending: `${req.headers.get('origin')}/api/statuspagamento?pagamento_id=${Date.now()}&status=pending`,
      },
      auto_return: 'approved' as 'approved',
      external_reference: `${Date.now()}`, // Adicionar um identificador único para referência
    };

    // Criação da preferência de pagamento
    const response = await mercadopago.preferences.create(preference);

    // Armazenar detalhes do agendamento no banco de dados com o pagamento_id gerado
    await query('INSERT INTO agendamentos_pending (pagamento_id, empresa_id, servico, data_hora, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)', [
      response.body.id, // Utilizar o id da preferência como pagamento_id
      empresaId,
      servico,
      data_hora,
      nome,
      telefone
    ]);

    // Retornar a resposta com o ID da preferência
    return NextResponse.json({ id: response.body.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json({ error: 'Erro ao criar preferência.' }, { status: 500 });
  }
}
