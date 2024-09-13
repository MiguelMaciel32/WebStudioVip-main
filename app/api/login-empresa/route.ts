import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET_EMPRESA = 'luismiguel-empresa'; // Chave secreta distinta para empresa

export async function POST(request: NextRequest) {
    const { cnpj, email, senha } = await request.json();

    if (!cnpj || !email || !senha) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    try {
        // Execute a query para buscar a empresa pelo CNPJ e email
        const results = await query(`
            SELECT * FROM empresas
            WHERE cnpj = ? AND email = ?
        `, [cnpj, email]);

        if (results.length === 0) {
            return NextResponse.json({ error: 'CNPJ ou email inválido.' }, { status: 401 });
        }

        const empresa = results[0];

        // Comparar a senha diretamente
        if (empresa.senha === senha) {
            const tokenEmpresa = jwt.sign(
                { id: empresa.id, username: empresa.username }, // Payload do JWT
                JWT_SECRET_EMPRESA,
                { expiresIn: '1h' }
            );

            // Usar uma imagem padrão se o campo profile_picture estiver vazio ou undefined
            const profilePicture = empresa.profile_picture || '/foto.jpg'; // Define uma imagem padrão

            // Retornar o token e outras informações corretamente
            return NextResponse.json({
                message: 'Login bem-sucedido',
                profilePicture, // Retorna a imagem de perfil ou a padrão
                name: empresa.name,
                tokenEmpresa // Retornar o token correto
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