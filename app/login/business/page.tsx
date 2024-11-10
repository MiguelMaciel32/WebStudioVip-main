'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function Business() {
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
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token_empresa', data.tokenEmpresa);
                sessionStorage.setItem('profileBusiness', data.profilePicture);

                toast({
                    title: 'Login bem-sucedido',
                    description: 'Você será redirecionado.',
                    type: 'foreground',
                });

                if (data.requiresOtp) {
                    setShowFaceID(true);
                } else {
                    router.push('/profile-business'); 
                }
            } else {
                setError(data.error || 'Erro ao fazer login.');
                toast({
                    title: 'Erro',
                    description: data.error || 'Erro ao fazer login.',
                    type: 'background',
                });
            }
        } catch (error) {
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
    };

    return (
        <main className="flex w-full h-screen overflow-y-hidden">
            <section className="mt-4 relative">
                <Link href={"/login"} >
                <Button variant={"outline"} size={"icon"} className="rounded-lg fixed inset-x-2">
                    <ArrowBigLeft />
                </Button>
                </Link>
            </section>
            <section className="flex flex-col w-1/2 gap-5 container p-16 justify-center grow md:w-full">
                <h1 className="font-bold flex justify-center text-3xl tracking-tighter leading-none text-center md:text-5xl">
                    Acesse sua conta empresarial!
                </h1>
                <p className="text-muted-foreground leading-relaxed text-center">
                    Comece a utilizar nossa plataforma com total liberdade após realizar o
                    login em nossos serviços.
                </p>
                <form className="space-y-2" onSubmit={handleLogin}>
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
                    <section className="flex flex-col gap-2 justify-center">
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" className="w-full">Login</Button>
                        <Link href={"/business"}>
                            <Button variant={"link"} className="w-full text-center">
                                Ou crie uma conta nova empresarial!
                            </Button>
                        </Link>
                    </section>
                </form>
            </section>
            <section className="bg-zinc-900 hidden justify-center items-center flex-col font-bold md:flex md:h-screen md:w-full">
                <h1 className="text-5xl text-white tracking-tighter text-center mx-4">
                    Seus clientes te esperam
                    <span className="link-color"> de volta</span>
                </h1>
                <Image
                    className="h-80 w-80 mt-4"
                    width={0}
                    height={0}
                    alt="Login"
                    src={"/undraw_access_account_re_8spm.svg"}
                />
            </section>
        </main>
    );
}
