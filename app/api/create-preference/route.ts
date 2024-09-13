import { NextRequest, NextResponse } from 'next/server';
import mercadopago from 'mercadopago';

// Configuração do MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || '', // Substitua pelo seu token
});

type Data = {
  id?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { description, price, quantity, empresaId, servico } = await req.json();

    // Validação básica dos parâmetros
    if (!description || !price || !quantity || !empresaId || !servico) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const preference = {
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Math.floor(Number(quantity)), // Garantir que seja um inteiro
        },
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/api/feedback?empresaId=${empresaId}&servico=${servico}`,
        failure: `${req.headers.get('origin')}/api/feedback?empresaId=${empresaId}&servico=${servico}`,
        pending: `${req.headers.get('origin')}/api/feedback?empresaId=${empresaId}&servico=${servico}`,
      },
      auto_return: 'approved' as 'approved',
    };

    // Criação da preferência de pagamento
    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({ id: response.body.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json({ error: 'Erro ao criar preferência.' }, { status: 500 });
  }
}