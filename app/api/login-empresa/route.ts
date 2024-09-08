import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel-empresa';

export async function POST(request: NextRequest) {
    const { cnpj, email, senha } = await request.json();

    if (!cnpj || !email || !senha) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    try {
        const results = await query(`
            SELECT * FROM empresas
            WHERE cnpj = ? AND email = ?
        `, [cnpj, email]);

        if (results.length === 0) {
            return NextResponse.json({ error: 'CNPJ ou email inválido.' }, { status: 401 });
        }

        const empresa = results[0];

        // Comparação direta da senha (não recomendado para produção)
        if (empresa.senha !== senha) {
            return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: empresa.id, cnpj: empresa.cnpj, email: empresa.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const response = NextResponse.json({
            success: true,
            profilePicture: empresa.logo,
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Habilitar em produção
            path: '/',
            maxAge: 60 * 60 // 1 hora
        });

        return response;

    } catch (error) {
        console.error('Erro ao autenticar empresa:', error);
        return NextResponse.json({ error: 'Erro ao autenticar empresa.' }, { status: 500 });
    }
}