import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';


const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, ''); 

    if (cpf.length !== 11) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
};


const validarTelefone = (telefone: string): boolean => {
    telefone = telefone.replace(/\D/g, ''); 
    return telefone.length === 11; 
};

export async function POST(request: NextRequest) {
    const { nome, cpf, email, telefone, senha } = await request.json();

    if (!nome || !cpf || !email || !telefone || !senha) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    if (!validarCPF(cpf)) {
        return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 });
    }

    if (!validarTelefone(telefone)) {
        return NextResponse.json({ error: 'Número de telefone inválido.' }, { status: 400 });
    }

    try {
        const result = await query(`
            INSERT INTO users (username, password, profile_picture, name, sobre, contact)
            VALUES (?, ?, NULL, ?, NULL, ?)
        `, [email, senha, nome, telefone]);

        return NextResponse.json({ success: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return NextResponse.json({ error: 'Erro ao cadastrar usuário.' }, { status: 500 });
    }
}