import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Suponho que você tenha uma função query para interagir com o banco de dados
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel';

export async function GET(request: NextRequest) {
  try {
    // Obter o agendamento_id da query string
    const { searchParams } = new URL(request.url);
    const agendamento_id = Number(searchParams.get('id'));

    if (!agendamento_id || isNaN(agendamento_id)) {
      return NextResponse.json({ error: 'O agendamento_id é necessário e deve ser um número.' }, { status: 400 });
    }

    // Verificar o cabeçalho de autorização para o token
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    // Extrair o token do cabeçalho
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string }; // Suponha que você tenha o campo `role` no JWT

    // Consultar as mensagens e o usuário baseado no tipo de usuário (cliente ou empresa)
    let user, mensagens;

    if (decoded.role === 'cliente') {
      // Cliente: carregar informações do cliente e mensagens para o agendamento
      user = await query(`
        SELECT id, name, profile_picture FROM users WHERE id = ?`, [decoded.id]);

      mensagens = await query(`
        SELECT m.id, m.data_hora, m.mensagem, m.agendamento_id, u.name as enviado_por
        FROM mensagens m
        JOIN users u ON m.user_id = u.id
        WHERE m.agendamento_id = ?
        ORDER BY m.data_hora ASC`, [agendamento_id]);

    } else if (decoded.role === 'empresa') {
      // Empresa: carregar informações da empresa e mensagens para o agendamento
      user = await query(`
        SELECT id, name, profile_picture FROM users WHERE id = (
          SELECT user_id FROM agendamentos WHERE id = ?
        )`, [agendamento_id]);

      mensagens = await query(`
        SELECT m.id, m.data_hora, m.mensagem, m.agendamento_id, u.name as enviado_por
        FROM mensagens m
        JOIN users u ON m.user_id = u.id
        WHERE m.agendamento_id = ?
        ORDER BY m.data_hora ASC`, [agendamento_id]);
    } else {
      return NextResponse.json({ error: 'Tipo de usuário inválido.' }, { status: 401 });
    }

    if (!user.length) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user: user[0], mensagens }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados do chat:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do chat.' }, { status: 500 });
  }
}
