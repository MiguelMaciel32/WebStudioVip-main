import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Importe sua função de consulta ao banco de dados

export async function GET() {
  try {
    console.log('Iniciando consulta ao banco de dados...');
    
    // Execute a consulta para obter a empresa com o ID específico
    const results = await query('SELECT * FROM empresas WHERE id = ?', [1]); // Substitua '1' pelo ID real ou lógica apropriada

    console.log('Resultado da consulta:', results);

    // Verifique se a empresa foi encontrada
    const [company] = results;

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    // Retorne a resposta com os dados da empresa
    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    // Captura e tratamento de erros
    if (error instanceof Error) {
      console.error('Erro no servidor:', error.message);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    } else {
      console.error('Erro desconhecido no servidor');
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
  }
}