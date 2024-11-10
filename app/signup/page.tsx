'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export default function Cadastro() {
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [cep, setCep] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const router = useRouter();

  const formatarTelefone = (valor: string) => {
    valor = valor.replace(/\D/g, "");
    return valor.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
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
          setEndereco(data.logradouro);
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

  const cadastrarUsuario = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/cadastrar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, telefone, senha, cep, endereco, cidade, estado }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          description: "Conta criada com sucesso!",
        });
        router.push('/profile');
      } else {
        toast({
          description: `Erro: ${data.error || 'Erro ao criar conta!'}`,
        });
      }

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        description: 'Erro ao criar conta!',
      });
    }
  };

  return (
    <main className="flex w-full h-screen overflow-y-hidden">
      <section className="flex flex-col gap-5 container p-16 justify-center">
        <h1 className="font-bold flex justify-center text-3xl tracking-tighter leading-none text-center md:text-5xl">
          Cadastre-se!
        </h1>
        <p className="text-muted-foreground leading-relaxed text-center">
          Comece a utilizar nossa plataforma com total liberdade após realizar o
          cadastro em nossos serviços.
        </p>
        <form className="space-y-2" onSubmit={cadastrarUsuario}>
          <Input 
            placeholder="Nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <Input 
            placeholder="Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            placeholder="Telefone" 
            type="text" 
            value={telefone}
            onChange={handleTelefoneChange}
            required
          />
          <Input 
            placeholder="Senha" 
            type="password" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Input 
            placeholder="CEP" 
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            required
          />
          <Input 
            placeholder="Endereço" 
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />
          <Input
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="" disabled>Selecione o estado</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
          <Button className="gap-2 justify-center w-full" type="submit">
            <Sparkles size={16} />
            Criar minha conta!
          </Button>
        </form>
        <section className="flex flex-col gap-2 justify-center">
          <Link href={"/login"} className="flex">
            <Button variant={"link"} className="flex justify-center w-full">
              Ou entre em uma conta existente!
            </Button>
          </Link>
        </section>
      </section>
      <section className="bg-zinc-900 hidden justify-center items-center flex-col font-bold md:flex md:h-screen md:w-full">
        <h1 className="text-5xl text-white text-center">
          Prepare-se
          <span className="text-violet-300"> pra uma nova jornada</span>
        </h1>

        <Image
          className="h-80 w-80"
          width={0}
          height={0}
          alt="Login "
          src={"/undraw_logic_re_nyb4.svg"}
        />
      </section>
    </main>
  );
}
