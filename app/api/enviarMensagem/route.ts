// app/api/enviarMensagem/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET_EMPRESA = 'luismiguel-empresa';

interface JwtPayload {
    id: string; // Altere para number se o ID for um número
    username: string;
}

export async function POST(request: NextRequest) {
    const { agendamento_id, mensagem, enviado_por } = await request.json();

    if (!agendamento_id || !mensagem || !enviado_por) {
        return NextResponse.json({ error: 'Agendamento ID, mensagem e ID do usuário são obrigatórios' }, { status: 400 });
    }

    const token_empresa = request.headers.get('authorization')?.split(' ')[1];
    let decodedToken: JwtPayload;

    if (token_empresa) {
        try {
            decodedToken = jwt.verify(token_empresa, JWT_SECRET_EMPRESA) as JwtPayload; // Tipo correto aqui
        } catch (error) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
    } else {
        return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    try {
        const newMessage = await saveMessageToDatabase(agendamento_id, mensagem, enviado_por, decodedToken.id);
        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        return NextResponse.json({ error: 'Erro ao salvar mensagem' }, { status: 500 });
    }
}

async function saveMessageToDatabase(agendamento_id: string, mensagem: string, enviado_por: string, empresaId: string) {
    // Lógica real do seu banco de dados aqui
    return {
        id: Math.random(), // Apenas para simular um ID único
        mensagem: mensagem,
        user_id: enviado_por,
        agendamento_id: agendamento_id,
    };
}
