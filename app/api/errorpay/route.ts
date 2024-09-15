import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pagamento_id = url.searchParams.get('pagamento_id');
    const status = url.searchParams.get('status');

    if (!pagamento_id || !status) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const redirectUrl = status === 'approved'
      ? `/successpay?pagamento_id=${pagamento_id}`
      : `/erropay?pagamento_id=${pagamento_id}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error('Erro ao processar o pagamento:', error);
    return NextResponse.json({ error: 'Erro ao processar o pagamento.' }, { status: 500 });
  }
}
