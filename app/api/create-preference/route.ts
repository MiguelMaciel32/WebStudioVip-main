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
    const externalReference = JSON.stringify({ nome, telefone, data_hora, empresaId });

    const preference = {
      items: [
        {
          title: servico,
          unit_price: parseFloat(precoServico.toFixed(2)), // Formata o preço para duas casas decimais
          quantity: 1, // Ajuste se necessário
        }
      ],
      back_urls: {
        success: 'http://localhost:3000/api/suce',
        failure: 'http://localhost:3000/api/erropay',
        pending: 'http://localhost:3000/api/pendente'
      },
      auto_return: 'approved' as 'approved', // Valor esperado pela API
      external_reference: externalReference // Adiciona a referência externa
    };

    // Log do objeto de preferência
    console.log('Objeto de preferência criado:', preference);

    // Faz a solicitação para criar a preferência no Mercado Pago
    const response = await mercadopago.preferences.create(preference);
    console.log('Resposta da API do Mercado Pago:', response);

    // Verifica a resposta e retorna o ponto inicial e o ID da preferência
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
