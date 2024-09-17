import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET_EMPRESA = 'luismiguel-empresa';

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

        if (empresa.senha === senha) {
            const tokenEmpresa = jwt.sign(
                { id: empresa.id, username: empresa.username }, 
                JWT_SECRET_EMPRESA,
                { expiresIn: '1h' }
            );

          
            const profilePicture = empresa.profile_picture || '/foto.jpg'; 
            return NextResponse.json({
                message: 'Login bem-sucedido',
                profilePicture,
                name: empresa.name,
                tokenEmpresa 
            });
        } else {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Erro no servidor:', error.message);
            return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
        } else {
            console.error('Erro desconhecido no servidor');
            return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
        }
    }
}