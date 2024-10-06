import { NextRequest, NextResponse } from 'next/server'; // Importando as funções do Next.js
import { execute } from '../../../lib/db'; // Importe suas funções de execução de consulta

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const empresa_id = searchParams.get('empresa_id'); // Obtendo empresa_id
  const plano = searchParams.get('plano'); // Obtendo plano
  let planoValor: string;
  let dataFimAssinatura = new Date();

  try {
    // Verifique se todos os parâmetros necessários estão presentes
    if (!empresa_id || !plano) {
      return NextResponse.json({ error: 'Parâmetros ausentes. PLANO OU EMPRESA ID.' }, { status: 400 });
    }

    switch (plano) {
      case 'mensal':
        planoValor = 'Mensal';
        dataFimAssinatura.setMonth(dataFimAssinatura.getMonth() + 1);
        break;
      case 'trimestral':
        planoValor = 'Trimestral';
        dataFimAssinatura.setMonth(dataFimAssinatura.getMonth() + 3);
        break;
      case 'anual':
        planoValor = 'Anual';
        dataFimAssinatura.setFullYear(dataFimAssinatura.getFullYear() + 1);
        break;
      default:
        return NextResponse.json({ error: 'Plano inválido. Atualização de assinatura não realizada.' }, { status: 400 });
    }

    await execute(
      `UPDATE empresas 
       SET assinatura_ativa = 1, 
           plano = ?, 
           data_fim_assinatura = ? 
       WHERE id = ?`,
      [planoValor, dataFimAssinatura.toISOString().slice(0, 19).replace('T', ' '), empresa_id]
    );

    return NextResponse.json({ message: 'Atualização de assinatura realizada com sucesso!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar assinatura.' }, { status: 500 });
  }
}
