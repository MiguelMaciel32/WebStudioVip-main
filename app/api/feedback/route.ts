// /Users/user/Documents/Web/app/api/feedback/route.ts

import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const externalReference = url.searchParams.get('external_reference');
        const paymentId = url.searchParams.get('payment_id');

        if (paymentId) {
            const paymentResponse = await mercadopago.payment.get(paymentId as any);

            if (paymentResponse) {
                console.log('Detalhes do pagamento:', JSON.stringify(paymentResponse, null, 2));
                const paymentStatus = paymentResponse.body.status;  // Status do pagamento
                const statusDetail = paymentResponse.body.status_detail;  // Detalhes do status

                if (paymentStatus === 'approved') {
                    return NextResponse.json({ success: true, message: 'Pagamento aprovado!', data: paymentResponse });
                } else {
                    console.log(`Pagamento não aprovado: ${statusDetail}`);
                    return NextResponse.json({ success: false, message: `Pagamento não aprovado: ${statusDetail}`, data: paymentResponse });
                }
            }
        }

        if (externalReference) {
            const decodedReference = decodeURIComponent(externalReference);
            const parsedReference = JSON.parse(decodedReference);

            console.log('Dados de referência externa:', parsedReference);

            if (parsedReference) {
                return NextResponse.json({ success: true, data: parsedReference });
            } else {
                console.error('Dados de referência externa inválidos:', parsedReference);
                return NextResponse.json({ error: 'Dados de referência externa inválidos.' }, { status: 400 });
            }
        } else {
            console.error('External reference não encontrado na URL');
            return NextResponse.json({ error: 'External reference não encontrado na URL.' }, { status: 400 });
        }
    } catch (error) {
        console.error('Erro ao processar o feedback:', error);
        return NextResponse.json({ error: 'Erro ao processar o feedback.' }, { status: 500 });
    }
}

// Implementação do webhook para receber notificações do Mercado Pago
export async function NOTIFICATIONS(request: Request) {
    try {
        const body = await request.json();
        console.log('Webhook recebido:', JSON.stringify(body, null, 2));

        if (body.type === 'payment') {
            const payment = body.data;
            const paymentStatus = payment.status;
            const statusDetail = payment.status_detail;

            if (paymentStatus === 'approved') {
                console.log('Pagamento aprovado:', payment);
                // Aqui você pode atualizar seu banco de dados ou realizar outras ações necessárias
            } else {
                console.log(`Pagamento não aprovado: ${statusDetail}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao processar o webhook:', error);
        return NextResponse.json({ error: 'Erro ao processar o webhook.' }, { status: 500 });
    }
}
