import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = 'luismiguel-empresa';

// Verifica se a chave secreta do Stripe está sendo carregada corretamente
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("A chave secreta do Stripe não foi definida.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-08-01', // Defina a versão da API aqui
});

export async function POST(req) {
  try {
    // Obter o token de autorização do cabeçalho da requisição
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const body = await req.json();
    const { plano } = body; // Extrai o plano do corpo da requisição
    console.log(plano);

    // Verifica se o token foi fornecido
    if (!token) {
      return NextResponse.json({ error: 'Acesso negado. Token não fornecido.' }, { status: 401 });
    }

    // Decodifica o token para obter o userId
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id; // Presumindo que o ID do usuário esteja no payload do JWT
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // Determina o priceId baseado no plano selecionado
    let priceId;
    switch (plano) {
      case 'mensal':
        priceId = 'price_1Q6laRJz7RrfV8r9YqzJo0o7';
        break;
      case 'trimestral':
        priceId = 'price_1Q6lZRJz7RrfV8r9sfphzrlF';
        break;
      case 'anual':
        priceId = 'price_1Q6laRJz7RrfV8r9YqzJo0o7';
        break;
      default:
        return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    // Criação da sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}&empresa_id=${userId}&plano=${plano}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`, // URL de cancelamento
    });

    // Retorna a URL de checkout para o cliente
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Erro ao criar sessão de checkout:", err); // Log do erro
    return NextResponse.json({ error: "Erro ao criar sessão de checkout." }, { status: 500 });
  }
}
