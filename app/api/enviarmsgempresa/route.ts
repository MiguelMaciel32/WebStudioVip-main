import { NextRequest, NextResponse } from 'next/server';
import { execute } from '../../../lib/db'; // Import your DB helper for inserting into the database
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

export async function POST(request: NextRequest) {
  try {
    const { agendamento_id, mensagem } = await request.json();

    if (!agendamento_id || !mensagem) {
      return NextResponse.json({ error: 'Agendamento ID e mensagem são obrigatórios.' }, { status: 400 });
    }

    // Get the Authorization header and decode the token
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    console.log(decoded);

    // Insert the message into the database with the empresa_id
    const result = await execute(
      `INSERT INTO mensagens (agendamento_id, empresa_id, mensagem, data_hora)
      VALUES (?, ?, ?, NOW())`,
      [agendamento_id, decoded.id, mensagem]
    );

    return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso.', result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
