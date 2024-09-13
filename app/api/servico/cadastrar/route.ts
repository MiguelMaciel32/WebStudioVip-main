import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function POST(request: Request) {
  const { nome, preco, duracao } = await request.json();
  
  if (!nome || !preco || !duracao) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
  }

  try {
    const empresaId = 1; // Substitua pelo id da empresa logada
    const result = await query(
      'INSERT INTO servicos (empresa_id, nome, preco, duracao) VALUES (?, ?, ?, ?)', 
      [empresaId, nome, preco, duracao]
    );
    return NextResponse.json({ message: 'Serviço cadastrado com sucesso.', result });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar serviço.' }, { status: 500 });
  }
}