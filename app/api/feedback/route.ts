import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const empresaId = searchParams.get('empresaId');
    const servico = searchParams.get('servico');

    // Verificar se os parâmetros essenciais estão presentes
    if (!paymentId || !status || !empresaId || !servico) {
      return NextResponse.json(
        { error: 'Informações insuficientes no feedback do pagamento.' },
        { status: 400 }
      );
    }

    // Aqui você pode fazer alguma lógica baseada no status do pagamento
    if (status === 'approved') {
      // Caso o pagamento tenha sido aprovado, você pode confirmar o agendamento ou realizar qualquer outro processo
      // Você pode retornar detalhes adicionais, como o ID do pagamento
      return NextResponse.json({
        message: 'Pagamento aprovado e agendamento confirmado!',
        paymentId: paymentId,
        servico: servico,
        empresaId: empresaId,
      }, { status: 200 });
    } else if (status === 'pending') {
      return NextResponse.json({
        message: 'Pagamento pendente. Aguardando confirmação.',
        paymentId: paymentId,
        status: status,
      }, { status: 202 });
    } else if (status === 'rejected') {
      return NextResponse.json({
        message: 'Pagamento rejeitado. Tente novamente.',
        paymentId: paymentId,
        status: status,
      }, { status: 400 });
    } else {
      return NextResponse.json({
        error: 'Status de pagamento desconhecido.',
        status: status,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao processar o feedback do pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o feedback do pagamento.' },
      { status: 500 }
    );
  }
}