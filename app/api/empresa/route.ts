export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';  

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); 

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 });
    }

    const empresa = await query(
      'SELECT id, nome_empresa, email, cnpj, telefone, sobre, address, logo, ambient_photo FROM empresas WHERE id = ?',
      [id]
    );

    if (empresa.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const servicos = await query(
      'SELECT id, nome, preco, duracao FROM servicos WHERE empresa_id = ?',
      [id]
    );

    // Retornar as informações da empresa e os serviços
    return NextResponse.json({ empresa: empresa[0], servicos }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json({ error: 'Erro ao buscar empresa.' }, { status: 500 });
  }
}