export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';


interface Empresa {
  id: number;
  nome_empresa: string;
  logo: string;
  ambient_photo: string;
  sobre: string;
}

const JWT_SECRET = 'luismiguel-empresa'; 
export async function GET(request: Request) {
  try {
   
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };


      const result = await query<Empresa>('SELECT * FROM empresas WHERE id = ?', [decoded.id]);

      if (result.length === 0) {
        return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
      }

      const empresa = result[0];
      return NextResponse.json(empresa);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}