import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';

// Configure o Mercado Pago com seu token de acesso
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN2;
if (!accessToken) {
  throw new Error('Mercado Pago access token is not defined');
}
mercadopago.configure({
  access_token: accessToken
});

export async function POST(request: Request) {
  try {
    console.log('Início da execução da função POST');

    // Recebe e loga o corpo da requisição
    const body = await request.json();
    console.log('Corpo da requisição recebido:', body);

    // Garantir que todos os campos necessários estejam presentes e definidos
    let { empresaId, servico, precoServico, data_hora, nome, telefone, userId } = body;

    // Conversão dos campos para os tipos corretos
    empresaId = Number(empresaId);
    precoServico = parseFloat(precoServico);
    data_hora = String(data_hora);
    nome = String(nome);
    telefone = String(telefone);
    userId = Number(userId);

    // Log dos dados recebidos
    console.log('Dados recebidos:');
    console.log('empresaId:', empresaId);
    console.log('servico:', servico);
    console.log('precoServico:', precoServico);
    console.log('data_hora:', data_hora);
    console.log('nome:', nome);
    console.log('telefone:', telefone);
    console.log('userId:', userId);

    // Valida os campos recebidos
    if (
      isNaN(empresaId) || 
      typeof servico !== 'string' ||
      isNaN(precoServico) || 
      typeof data_hora !== 'string' ||
      typeof nome !== 'string' ||
      typeof telefone !== 'string'
    ) {
      console.error('Dados inválidos recebidos');
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    // Cria o objeto de preferência
    const externalReference = JSON.stringify({ nome, telefone, data_hora, empresaId, userId });

    const preference = {
      items: [
        {
          title: servico,
          unit_price: parseFloat(precoServico.toFixed(2)),
          quantity: 1,
        }
      ],
      back_urls: {
        success: 'http://localhost:3000/sucess',
        failure: 'http://localhost:3000/erro',
        pending: 'http://localhost:3000/pendente'
      },
      auto_return: 'approved' as 'approved', 
      external_reference: externalReference
    };

    console.log('Objeto de preferência criado:', preference);

   
    const response = await mercadopago.preferences.create(preference);
    console.log('Resposta da API do Mercado Pago:', response);

    if (response.body.id) {
      console.log('Preferência criada com sucesso');
      return NextResponse.json({ init_point: response.body.init_point, preferenceId: response.body.id });
    } else {
      console.error('Erro ao criar preferência: Resposta da API não contém ID');
      return NextResponse.json({ error: "Erro ao criar preferência." }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json({ error: "Erro ao criar preferência." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const collectionId = url.searchParams.get('collection_id');
    const status = url.searchParams.get('status');
    const externalReference = url.searchParams.get('external_reference');
    const paymentId = url.searchParams.get('payment_id');

  
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
