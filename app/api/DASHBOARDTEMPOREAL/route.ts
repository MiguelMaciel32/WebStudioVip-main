import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

interface Empresa {
  id: number;
  agendamento_id: number;
  user_id: number;
  mensagem: string;
  data_hora: string;
}

interface DecodedToken {
  id: number; 
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa';


async function getAgendamentos(empresaId: number) {
  return query<Empresa[]>(`
      SELECT a.id, a.data_hora, a.servico, u.name as cliente, u.contact as email
      FROM agendamentos a
      JOIN users u ON a.user_id = u.id
      WHERE a.empresa_id = ?
      ORDER BY a.data_hora DESC
  `, [empresaId]);
}


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
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

 
    const agendamentos = await getAgendamentos(decoded.id);

    return NextResponse.json({ data: agendamentos });

  } catch (err) {
    console.error('Erro ao verificar ou consultar dados:', err);
    return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;


    const body = await request.json().catch(err => {
      console.error('Erro ao fazer parse do JSON:', err);
      return null;
    });


    if (!body) {
      console.warn('Corpo da requisição vazio ou inválido.');
      return NextResponse.json({ data: [] });
    }

    console.log('Dados recebidos no POST:', body);


    const agendamentos = await getAgendamentos(decoded.id);


    return NextResponse.json({ data: agendamentos });

  } catch (err) {
    console.error('Erro ao processar o POST:', err);
    return NextResponse.json({ error: 'Erro ao processar o POST.' }, { status: 500 });
  }
}
