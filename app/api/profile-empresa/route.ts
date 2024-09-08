import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface Empresa {
    id: number;
    nome_empresa: string;
    logo: string;
    email: string;
    sobre: string;
    contato: string;
}

interface DecodedToken {
    id: number;
}

const JWT_SECRET = 'luismiguel-empresa';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        const result = await query<Empresa[]>('SELECT * FROM empresas WHERE id = ?', [decoded.id]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
        }

        const empresa = result[0];
        return NextResponse.json(empresa);
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
}