import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'luismiguel-empresa'; 

export async function POST(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader) {
    return NextResponse.json({ error: 'Token de autorização não fornecido.' }, { status: 401 });
  }

  const token = authorizationHeader.split(' ')[1]; 

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado no cabeçalho.' }, { status: 401 });
  }
  
  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (err) {
    console.error('Erro na verificação do token:', err);
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 403 });
  }


  const empresa = await query(
    'SELECT assinatura_ativa, data_fim_assinatura FROM empresas WHERE id = ?',
    [decoded.id]
  );

  if (empresa.length === 0) {
    console.log('Empresa não encontrada para o ID:', decoded.id);
    return NextResponse.json({ isActive: false, message: 'Empresa não encontrada.' }, { status: 404 });
  }

  const { assinatura_ativa, data_fim_assinatura } = empresa[0];
  const isExpired = new Date(data_fim_assinatura) < new Date();

  if (assinatura_ativa && !isExpired) {
    return NextResponse.json({ isActive: true, message: 'Assinatura ativa.' }, { status: 200 });
  } else {
    return NextResponse.json({ isActive: false, message: 'Assinatura não está ativa ou expirou.' }, { status: 200 });
  }
}
