'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";
import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

export default function BusinessCadastro() {
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [cep, setCep] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const router = useRouter();

  const formatarTelefone = (valor: string): string => {
    const cleaned = valor.replace(/\D/g, '');
    const formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    return formatted;
  };

  const handleTelefoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedTelefone = formatarTelefone(e.target.value);
    setTelefone(formattedTelefone);
  };

  const buscarEndereco = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setAddress(data.logradouro);
          setCidade(data.localidade);
          setEstado(data.uf);
        } else {
          toast({
            description: "CEP inválido. Não foi possível encontrar um endereço para o CEP informado.",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          description: "Erro ao buscar o CEP. Tente novamente.",
        });
      }
    }
  };


  useEffect(() => {
    if (cep.length === 8) {
      buscarEndereco(cep);
    }
  }, [cep]);

  const cadastrarEmpresa = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/cadastrar-empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomeEmpresa, email, telefone, senha, address, cep, estado, cidade }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          description: "Conta empresarial criada com sucesso!",
        });
        router.push('/login/business');
      } else {
        toast({
          description: `Erro: ${data.error || 'Erro ao criar conta empresarial!'}`,
        });
      }
    } catch (error) {
      console.error('Erro ao criar conta empresarial:', error);
      toast({
        description: 'Erro ao criar conta empresarial!',
      });
    }
  };

  return (
    <main className="flex w-full h-screen overflow-y-hidden">
      <section className="mt-4 relative">
        <Link href={"/login/business"}>
          <Button variant={"outline"} size={"icon"} className="rounded-lg fixed inset-x-2">
            <ArrowBigLeft />
          </Button>
        </Link>
      </section>
      <section className="flex flex-col w-1/2 gap-5 container p-16 justify-center grow md:w-full">
        <h1 className="font-bold flex justify-center text-3xl tracking-tighter leading-none text-center md:text-5xl">
          Crie sua conta empresarial!
        </h1>
        <p className="text-muted-foreground leading-relaxed text-center">
          Comece a utilizar nossa plataforma com total liberdade após realizar o
          login em nossos serviços.
        </p>
        <form className="space-y-2" onSubmit={cadastrarEmpresa}>
          <Input 
            placeholder="Nome da Empresa" 
            value={nomeEmpresa}
            onChange={(e) => setNomeEmpresa(e.target.value)}
          />
          <Input 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            placeholder="Telefone" 
            type="text" 
            value={telefone}
            onChange={handleTelefoneChange}
          />
          <Input 
            placeholder="Senha" 
            type="password" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Input 
            placeholder="Endereço" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input 
            placeholder="CEP" 
            value={cep}
            onChange={(e) => setCep(e.target.value)}
          />
          <Input 
            placeholder="Estado" 
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <Input 
            placeholder="Cidade" 
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <Button className="gap-2 justify-center w-full" type="submit">
            Cadastrar nova conta empresarial!
          </Button>
        </form>
        <section className="flex flex-col gap-2 justify-center">
          <Link href={"/login/business"}>
            <Button variant={"link"} className="w-full text-center">
              Ou entre em uma conta empresarial existente!
            </Button>
          </Link>
        </section>
      </section>
      <section className="bg-zinc-900 hidden justify-center items-center flex-col font-bold md:flex md:h-screen md:w-full">
        <h1 className="text-5xl text-white tracking-tighter text-center mx-4">
          Inicie sua jornada empresarial
          <span className="link-color"> conosco!</span>
        </h1>
      </section>
    </main>
  );
}
