'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function LoginPage() {
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/login-empresa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cnpj, email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('tokenempresa', data.tokenempresa);
                sessionStorage.setItem('profilePicture', data.profilePicture);

                toast({
                    title: 'Login bem-sucedido',
                    description: 'Você será redirecionado.',
                    type: 'foreground', // Ajustado para um tipo aceito
                });

                if (data.requiresOtp) {
                    router.push('/face-id'); 
                } else {
                    router.push('/profile-business'); // Caso contrário, vai para o dashboard
                }
            } else {
                setError(data.error || 'Erro ao fazer login.');
                toast({
                    title: 'Erro',
                    description: data.error || 'Erro ao fazer login.',
                    type: 'background', // Ajustado para um tipo aceito
                });
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor.');
            toast({
                title: 'Erro de Conexão',
                description: 'Não foi possível conectar ao servidor.',
                type: 'background', // Ajustado para um tipo aceito
            });
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Login</h1>
            <form className="mt-4 space-y-4" onSubmit={handleLogin}>
                <Input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit">Entrar</Button>
            </form>
        </div>
    );
}