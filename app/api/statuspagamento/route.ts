export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

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

    const redirectUrl = status === 'approved'
      ? `/successpay?pagamento_id=${payment_id}`
      : `/erropay?pagamento_id=${payment_id}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url).href);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 500 });
  }
}
