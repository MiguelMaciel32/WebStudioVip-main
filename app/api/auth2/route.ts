import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = 'luismiguel'; // Substitua por uma chave mais segura

export async function POST(request: NextRequest) {
    const { cnpj, email, senha } = await request.json();

    // Verifica se todos os campos foram preenchidos
    if (!cnpj || !email || !senha) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    try {
        // Obtém o registro da empresa pelo CNPJ e email
        const results = await query(`
            SELECT * FROM empresas
            WHERE cnpj = ? AND email = ?
        `, [cnpj, email]);

        // Verifica se a empresa foi encontrada
        if (results.length === 0) {
            return NextResponse.json({ error: 'CNPJ ou email inválido.' }, { status: 401 });
        }

        const empresa = results[0];

        // Verifica a senha usando bcrypt
        const passwordMatch = await bcrypt.compare(senha, empresa.senha);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
        }

        // Gerar um token JWT
        const token = jwt.sign(
            { id: empresa.id, cnpj: empresa.cnpj, email: empresa.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const response = NextResponse.json({ success: true, profilePicture: empresa.logo });
        
        // Define o cookie com o token
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