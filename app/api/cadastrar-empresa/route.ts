import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';


const validarCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14) return false; 

    let soma = 0;
    let pos = 5;

    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(cnpj.charAt(12))) return false;

    soma = 0;
    pos = 6;

    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(cnpj.charAt(13))) return false;

    return true;
};


const validarTelefone = (telefone: string): boolean => {
    telefone = telefone.replace(/\D/g, ''); 
    return telefone.length === 11; 
};

export async function POST(request: NextRequest) {
    const { nomeEmpresa, cnpj, email, telefone, senha, address } = await request.json();


    if (!nomeEmpresa || !cnpj || !email || !telefone || !senha || !address) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

 
    if (!validarCNPJ(cnpj)) {
        return NextResponse.json({ error: 'CNPJ inválido.' }, { status: 400 });
    }


    if (!validarTelefone(telefone)) {
        return NextResponse.json({ error: 'Número de telefone inválido.' }, { status: 400 });
    }

    try {
        const result = await query(`
          INSERT INTO empresas (nome_empresa, cnpj, email, telefone, senha, address)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [nomeEmpresa, cnpj, email, telefone, senha, address]);

        return NextResponse.json({ success: 'Empresa cadastrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        return NextResponse.json({ error: 'Erro ao cadastrar empresa.' }, { status: 500 });
    }
}
