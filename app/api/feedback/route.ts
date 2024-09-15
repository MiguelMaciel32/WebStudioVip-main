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

function convertISOToMySQLDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toISOString().replace('T', ' ').split('.')[0];
}

// Função para lidar com POST
export async function POST(req: NextRequest) {
  try {
    const { description, price, quantity, empresaId, servico, data_hora, nome, telefone } = await req.json();

    if (!description || !price || !quantity || !empresaId || !servico || !data_hora || !nome || !telefone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const formattedDate = convertISOToMySQLDate(data_hora);

    const preference = {
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Math.floor(Number(quantity)),
        },
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/successpay?status=approved`,
        failure: `${req.headers.get('origin')}/erropay?status=rejected`,
        pending: `${req.headers.get('origin')}/pendente?status=pending`,
      },
      auto_return: 'approved' as 'approved',
      external_reference: '', // Inicialmente vazio, será preenchido após criação da preferência
    };

    const response = await mercadopago.preferences.create(preference);

    preference.external_reference = response.body.id;

    await query('INSERT INTO agendamentos_pending (pagamento_id, empresa_id, servico, data_hora, nome, telefone) VALUES (?, ?, ?, ?, ?, ?)', [
      response.body.id, 
      empresaId,
      servico,
      formattedDate,
      nome,
      telefone
    ]);

    return NextResponse.json({ id: response.body.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json({ error: 'Erro ao criar preferência.' }, { status: 500 });
  }
}

// Função para lidar com GET
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const empresaId = url.searchParams.get('empresaId');
    const servico = url.searchParams.get('servico');
    const collection_id = url.searchParams.get('collection_id');
    const collection_status = url.searchParams.get('collection_status');
    const payment_id = url.searchParams.get('payment_id');
    const status = url.searchParams.get('status');

    if (!empresaId || !servico || !collection_id || !collection_status || !payment_id || !status) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Processar o status do pagamento
    const redirectUrl = status === 'approved'
      ? `/suce?pagamento_id=${payment_id}`
      : `/erro?pagamento_id=${payment_id}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url).href);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 500 });
  }
}
