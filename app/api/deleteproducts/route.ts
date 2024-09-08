import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Ajuste o caminho conforme necessário

export async function DELETE(req: Request) {
  try {
    const { id, produtoId } = await req.json();

    if (!id || !produtoId) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Construa a atualização do produto a ser removido
    const updateFields = ['produto1', 'produto2', 'produto3'];
    let updateSQL = 'UPDATE empresas SET ';
    let updateValues: any[] = [];

    // Remove o produto específico
    updateFields.forEach((field, index) => {
      updateSQL += `${field} = CASE WHEN ? = ? THEN NULL ELSE ${field} END`;
      updateValues.push(produtoId);
      updateValues.push(index);
      if (index < updateFields.length - 1) {
        updateSQL += ', ';
      }
    });

    updateSQL += ' WHERE id = ?';
    updateValues.push(id);

    await query(updateSQL, updateValues);

    return NextResponse.json({ message: 'Produto removido com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return NextResponse.json({ error: 'Erro ao remover produto.' }, { status: 500 });
  }
}