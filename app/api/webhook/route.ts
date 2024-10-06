import Stripe from 'stripe';
import { buffer } from 'micro';
import { NextResponse, NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Configuração do Next.js para não usar bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Handler do webhook
const webhookHandler = async (req: NextRequest) => {
  // Definindo os cabeçalhos CORS manualmente
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Se for uma pré-requisição, retorne apenas os cabeçalhos
    return res;
  }

  if (req.method === 'POST') {
    // Transformando o corpo da requisição em um buffer
    const buf = await buffer(req as any); // Cast para 'any'
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, signature as string, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`❌ Error message: ${errorMessage}`);
      return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    console.log('✅ Success:', event.id);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent status: ${paymentIntent.status}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.last_payment_error?.message}`);
        break;
      }
      case 'charge.succeeded': {
        const charge = event.data.object;
        console.log(`Charge id: ${charge.id}`);
        break;
      }
      default: {
        console.warn(`Unhandled event type: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } else {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }
};

// Exportando o handler
export default webhookHandler;