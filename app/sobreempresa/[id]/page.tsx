'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AgendamentoTrigger from "@/components/AgendamentoTrigger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { parseJwt } from "../../../lib/jwtUtils"; // Importa a função de decodificação

interface Empresa {
  id: number;
  nome_empresa: string;
  email: string;
  cnpj: string;
  telefone: string;
  sobre: string | null;
  address: string;
  logo: string | null;
}

interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao: string;
}

function SobreEmpresa() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [userId, setUserId] = useState<number | undefined>(undefined); // Use undefined por padrão

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.id);

      // Log do userId para verificar se foi obtido corretamente
      console.log("User ID decodificado:", decodedToken.id);
    }

    if (id) {
      fetch(`/api/empresa?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setEmpresa(data.empresa);
          setServicos(data.servicos || []);
        })
        .catch((error) => console.error('Erro ao buscar empresa:', error));
    }
  }, [id]);

  if (!empresa) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <main className="flex flex-col justify-normal p-6 space-y-4">
        <header className="container grid grid-cols-1 md:grid-cols-2 place-items-center mb-24">
          <section className="flex justify-center mb-4 md:mb-0">
            <Image
              src={empresa.logo || "/Empresa.jpg"}
              alt={empresa.nome_empresa}
              width={300}
              height={300}
              className="aspect-video object-cover rounded-lg min-w-fit max-w-2xl"
            />
          </section>
          <section className="space-y-4">
            <h1 className="font-bold tracking-tighter text-3xl md:text-5xl leading-tight">
              Sobre a empresa
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {empresa.sobre || 'Atualizar Informações!'}
            </p>
          </section>
        </header>

        {/* Sessão de serviços */}
        <section className="space-y-4">
          <h2 className="font-bold tracking-tighter text-3xl md:text-4xl leading-tight text-start md:text-center mb-4">
            Serviços
          </h2>

          {servicos.map((servico) => (
            <section key={servico.id} className="border p-2 px-4 rounded flex items-center gap-4">
              <section className="flex-1 items-center">
                <p>{servico.nome}</p>
              </section>
              <section>
                <p className="font-medium">R${servico.preco}</p>
                <p className="text-muted-foreground">{servico.duracao}</p>
              </section>
              <AgendamentoTrigger
                empresaId={empresa.id}
                servico={servico.nome}
                precoServico={servico.preco}
                userId={userId} // Passa o userId aqui
              >
                <Button variant={"secondary"}>Reservar</Button>
              </AgendamentoTrigger>
            </section>
          ))}
        </section>

        {/* Informações adicionais sobre a empresa */}
        <section className="space-y-4">
          <h2 className="font-bold tracking-tighter text-3xl md:text-4xl leading-tight text-start md:text-center">
            Veja mais informações sobre essa empresa
          </h2>
          <Card className="">
            <CardHeader className="">
              <CardTitle>Endereços</CardTitle>
            </CardHeader>
            <CardContent className="">
              <p>{empresa.address}</p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader className="">
              <CardTitle>Contatos</CardTitle>
              <CardDescription className="">
                Contate-nos através de suas redes sociais mais utilizadas!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <p>{empresa.telefone}</p>
              <p>{empresa.email}</p>
              <p>{empresa.cnpj}</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default SobreEmpresa;
