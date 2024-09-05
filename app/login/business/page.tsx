'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Business() {
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
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('profilePicture', data.profilePicture);
        sessionStorage.setItem('userType', 'company');
        router.push('/profile-business'); // Redireciona para o perfil da empresa
      } else {
        setError(data.error || 'Erro ao fazer login.');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor.');
    }
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
            placeholder="CNPJ"
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit">Entrar</Button>
        </form>
        <section className="flex flex-col gap-2 justify-center">
          <Link href={"/signup/business"}>
            <Button variant={"link"} className="w-full text-center">
              Ou crie uma conta nova empresarial!
            </Button>
          </Link>
        </section>
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
          alt="Login "
          src={"/undraw_access_account_re_8spm.svg"}
        />
      </section>
    </main>
  );
}
