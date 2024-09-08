import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Ajuste o caminho conforme necessário

export async function PUT(req: Request) {
  try {
    const {
      id,
      nome_empresa,
      email,
      cnpj,
      telefone,
      sobre,
      address,
      logo,
      produto1,
      produto2,
      produto3
    } = await req.json();

    if (!id || !nome_empresa || !email || !cnpj || !telefone || !address) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    await query(
      `UPDATE empresas 
       SET 
         nome_empresa = ?, 
         email = ?, 
         cnpj = ?, 
         telefone = ?, 
         sobre = ?, 
         address = ?, 
         logo = ?, 
         produto1 = ?, 
         produto2 = ?, 
         produto3 = ?
       WHERE id = ?`,
      [nome_empresa, email, cnpj, telefone, sobre, address, logo, produto1, produto2, produto3, id]
    );

    return NextResponse.json({ message: 'Empresa atualizada com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar empresa.' }, { status: 500 });
  }
}