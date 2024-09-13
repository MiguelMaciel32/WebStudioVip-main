'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import FaceIDCapture from '@/components/faceid';

export default function LoginPage() {
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showFaceID, setShowFaceID] = useState(false);
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
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
                // Certifique-se de que está acessando o tokenEmpresa corretamente
                sessionStorage.setItem('token_empresa', data.tokenEmpresa);
                sessionStorage.setItem('profileBusiness', data.profilePicture);

                // Exibir notificação de sucesso
                toast({
                    title: 'Login bem-sucedido',
                    description: 'Você será redirecionado.',
                    type: 'foreground',
                });

                // Verificar se precisa de FaceID (ou outro OTP)
                if (data.requiresOtp) {
                    setShowFaceID(true);
                } else {
                    router.push('/profile-business'); // Redireciona para o perfil da empresa
                }
            } else {
                // Exibir mensagem de erro da API
                setError(data.error || 'Erro ao fazer login.');
                toast({
                    title: 'Erro',
                    description: data.error || 'Erro ao fazer login.',
                    type: 'background',
                });
            }
        } catch (error) {
            // Exibir erro de conexão com o servidor
            setError('Erro ao conectar com o servidor.');
            toast({
                title: 'Erro de Conexão',
                description: 'Não foi possível conectar ao servidor.',
                type: 'background',
            });
        }
    };

    const handleCloseModal = () => {
        setShowFaceID(false);
    };

    const handleSuccess = () => {
        handleCloseModal();
        router.push('/profile-business');
    };

    const handleFailure = () => {
        handleCloseModal();
        // Lógica adicional, se necessário
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Login da Empresa</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="CNPJ"
                    className="w-full"
                    required
                />
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full"
                    required
                />
                <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Senha"
                    className="w-full"
                    required
                />
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full">Login</Button>
            </form>
            {showFaceID && (
                <FaceIDCapture
                    onSuccess={handleSuccess}
                    onFailure={handleFailure}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}