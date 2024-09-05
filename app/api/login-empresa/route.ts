import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

        // Verifica a senha (comparando diretamente)
        if (empresa.senha !== senha) {
            return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
        }

        // Autenticação bem-sucedida
        // Aqui você pode criar um token JWT ou definir uma sessão
        const token = 'exemplo_de_token'; // Substitua por um token JWT gerado

        return NextResponse.json({ success: true, token, profilePicture: empresa.logo });
    } catch (error) {
        console.error('Erro ao autenticar empresa:', error);
        return NextResponse.json({ error: 'Erro ao autenticar empresa.' }, { status: 500 });
    }
}
