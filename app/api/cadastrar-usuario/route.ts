import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

const validarTelefone = (telefone: any) => {
    telefone = telefone.replace(/\D/g, ''); 
    return telefone.length === 11; 
};

export async function POST(request: NextRequest) {
    const { nome, email, telefone, senha, cep, cidade, estado } = await request.json();

    // Verificação dos campos obrigatórios
    if (!nome || !email || !telefone || !senha || !cep || !cidade || !estado) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // Validação do número de telefone
    if (!validarTelefone(telefone)) {
        return NextResponse.json({ error: 'Número de telefone inválido.' }, { status: 400 });
    }

    try {
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(senha, saltRounds); 

        // Inserir o usuário no banco de dados com o campo `cep`
        const result = await query(`
            INSERT INTO users (name, username, password, contact, cep, estado, cidade)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [nome, email, hashedPassword, telefone, cep, estado, cidade]);

        return NextResponse.json({ success: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return NextResponse.json({ error: 'Erro ao cadastrar usuário.' }, { status: 500 });
    }
}
