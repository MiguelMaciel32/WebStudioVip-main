import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function PUT(req: Request) {
    try {
        const { id, profile_picture, ambient_photo, address, product_image1, product_image2, product_image3 } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID da empresa não fornecido.' }, { status: 400 });
        }

        await query(
            `UPDATE empresas 
             SET profile_picture = ?, ambient_photo = ?, address = ?, product_image1 = ?, product_image2 = ?, product_image3 = ?
             WHERE id = ?`,
            [profile_picture, ambient_photo, address, product_image1, product_image2, product_image3, id]
        );

        return NextResponse.json({ message: 'Configurações da empresa atualizadas com sucesso!' }, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar configurações da empresa:', error);
        return NextResponse.json({ error: 'Erro ao atualizar configurações da empresa.' }, { status: 500 });
    }
}