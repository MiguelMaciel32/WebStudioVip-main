import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { plano, precoPlano, empresaId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}`,
              description: `Assinatura ${plano}`,
            },
            unit_amount: Math.round(precoPlano * 100), // Convertendo para centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sucess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        empresaId,
        plano,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json({ error: "Erro ao criar sessão de checkout" }, { status: 500 });
  }
}
