import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function PUT(req: Request) {
    try {
        const { empresaId, descricao, logoEmpresa } = await req.json();

        if (!empresaId) {
            return NextResponse.json({ error: 'ID da empresa não fornecido.' }, { status: 400 });
        }

        await query(
            'UPDATE empresas SET sobre = ?, logo = ? WHERE id = ?',
            [descricao, logoEmpresa, empresaId]
        );

        return NextResponse.json({ message: 'Informações da empresa atualizadas com sucesso!' }, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar informações da empresa:', error);
        return NextResponse.json({ error: 'Erro ao atualizar informações da empresa.' }, { status: 500 });
    }
}