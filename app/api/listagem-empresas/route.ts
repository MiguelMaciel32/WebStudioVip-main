import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    // Ajuste a consulta para refletir a tabela correta e as colunas
    const results = await query(
      'SELECT id, nome_empresa AS company_name, address, logo FROM empresas WHERE nome_empresa IS NOT NULL'
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return NextResponse.json({ error: 'Erro ao listar empresas.' }, { status: 500 });
  }
}