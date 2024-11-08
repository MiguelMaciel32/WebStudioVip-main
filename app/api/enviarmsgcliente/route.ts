// app/api/enviarmsgcliente/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { execute } from '../../../lib/db'; // Supondo que execute é um helper para interagir com o banco de dados
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel'; // Segredo específico para o cliente

export async function POST(request: NextRequest) {
  try {
    const { agendamento_id, mensagem } = await request.json();

    if (!agendamento_id || !mensagem) {
      return NextResponse.json({ error: 'Agendamento ID e mensagem são obrigatórios.' }, { status: 400 });
    }

    // Pegando o cabeçalho de autorização e decodificando o token
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verificando e decodificando o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const clienteId = decoded.id;

    // Inserindo a mensagem no banco de dados
    const result = await execute(
      `INSERT INTO mensagens (agendamento_id, user_id, mensagem, data_hora)
      VALUES (?, ?, ?, NOW())`,
      [agendamento_id, clienteId, mensagem]
    );

    return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso.', result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
