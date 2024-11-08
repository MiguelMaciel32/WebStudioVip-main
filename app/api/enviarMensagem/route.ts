import { NextRequest, NextResponse } from 'next/server';
import { execute } from '../../../lib/db'; // Helper para interação com o banco de dados
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel';

export async function POST(request: NextRequest) {
  try {
    // Extrair o corpo da requisição
    const { agendamento_id, mensagem } = await request.json();

    // Verificar se o token de autorização está presente nos headers
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    // Extrair o token do cabeçalho
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verificar o token e decodificá-lo para obter o ID do usuário
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Inserir a mensagem no banco de dados
    const result = await execute(
      `INSERT INTO mensagens (agendamento_id, empresa_id, mensagem, data_hora)
       VALUES (?, ?, ?, NOW())`,
      [agendamento_id, decoded.id, mensagem]
    );

    // Retornar resposta de sucesso
    return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso.', result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
