import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';


const validarTelefone = (telefone: string): boolean => {
    telefone = telefone.replace(/\D/g, ''); 
    return telefone.length === 11;
};

export async function POST(request: NextRequest) {
    const { nomeEmpresa, email, telefone, senha, address, cep, estado, cidade } = await request.json();
    let plano = 'gratuito';

  
    if (!nomeEmpresa || !cep || !email || !telefone || !senha || !address || !cep || !estado || !cidade) {
        return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

   
    if (!validarTelefone(telefone)) {
        return NextResponse.json({ error: 'Número de telefone inválido.' }, { status: 400 });
    }

    try {
        const result = await query(`
          INSERT INTO empresas (nome_empresa, email, telefone, senha, address, cep, estado, cidade, assinatura_ativa, plano)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `, [nomeEmpresa, email, telefone, senha, address, cep, estado, cidade, plano]);

        return NextResponse.json({ success: 'Empresa cadastrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        return NextResponse.json({ error: 'Erro ao cadastrar empresa.' }, { status: 500 });
    }
}
