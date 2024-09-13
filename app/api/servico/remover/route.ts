import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'luismiguel-empresa'; // O segredo do JWT

export async function DELETE(request: Request) {
  try {
    // Recupera o token JWT do cabeçalho
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Lê o corpo da requisição para obter o ID do serviço
    const { servicoId } = await request.json();

    if (!servicoId) {
      return NextResponse.json({ error: 'ID do serviço não fornecido.' }, { status: 400 });
    }

    // Verifica se o serviço pertence à empresa (para garantir que a empresa só pode deletar seus próprios serviços)
    const checkService = await query('SELECT * FROM servicos WHERE id = ? AND empresa_id = ?', [servicoId, decoded.id]);

    if (checkService.length === 0) {
      return NextResponse.json({ error: 'Serviço não encontrado ou não pertence à empresa.' }, { status: 404 });
    }

    // Remove o serviço do banco de dados
    await query('DELETE FROM servicos WHERE id = ?', [servicoId]);

    return NextResponse.json({ message: 'Serviço removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}