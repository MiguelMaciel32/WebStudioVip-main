import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db'; 
import jwt from 'jsonwebtoken';

interface Empresa {
  id: number;
}

interface DecodedToken {
  id: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';

export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader) {
    return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
  }

  const token = authorizationHeader.split(' ')[1]; 

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
  }

  try {
    // Decodifica e verifica o token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    // Consulta agendamentos filtrando pelo id da empresa
    const agendamentos = await query<Empresa[]>(`
      SELECT a.id, a.data_hora, a.servico, u.name as cliente, u.contact as email
      FROM agendamentos a
      JOIN users u ON a.user_id = u.id
      WHERE a.empresa_id = ?
      ORDER BY a.data_hora DESC
    `, [decoded.id]);

    return NextResponse.json(agendamentos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos.' }, { status: 500 });
  }
}
