import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';  // Ajuste o caminho conforme necessário

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');  // Obtém o ID da URL

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 });
    }

    const results = await query(
      'SELECT id, nome_empresa, email, cnpj, telefone, sobre, address, logo FROM empresas WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(results[0], { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json({ error: 'Erro ao buscar empresa.' }, { status: 500 });
  }
}