'use client'

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparkleIcon, Sparkles, Mail } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
} from "@/components/ui/carousel";
import SearchInputWithIcon from "@/components/Input-Icon";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star } from "lucide-react";

interface Empresa {
  id: number;
  company_name: string;
  address: string;
  logo: string | null;
  ambient_photo: string | null;
  total_agendamentos: number;
}

export default function Home() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [showTutorial, setShowTutorial] = useState<boolean>(false); 

  useEffect(() => {
    const tutorial = localStorage.getItem('tutorial');
    if (!tutorial) {
      setShowTutorial(true);
    }

    const fetchEmpresas = async () => {
      try {
        const response = await fetch("https://us-central1-scadaiot-c8a2b.cloudfunctions.net/empresastop");
        
        if (!response.ok) {
          throw new Error('Falha na requisição');
        }

        const data = await response.json();


        console.log("Dados recebidos da API:", data);


        if (Array.isArray(data)) {
          setEmpresas(data);
        } else {
          console.error("A resposta da API não contém um array de empresas.");
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchEmpresas();

    if (showTutorial) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { element: '#hero', popover: { title: 'Bem-vindo ao Studio Vip', description: 'Aqui você pode achar salões para sua beleza com facilidade.' } },
          { element: '#start-journey', popover: { title: 'Comece sua jornada', description: 'Clique aqui para criar sua conta e começar a usar o Studio Vip.' } },
          { element: '#popular-brands', popover: { title: 'Marcas Populares', description: 'Conheça algumas das marcas que confiam em nossos serviços.' } },
          { element: '#help-section', popover: { title: 'Precisa de ajuda?', description: 'Entre em contato conosco se tiver alguma dúvida.' } },
        ]
      });

      driverObj.drive();

    
      localStorage.setItem('tutorial', 'true');
      setShowTutorial(false);
    }

  }, [showTutorial]);

  return (
    <main className="flex min-h-screen flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
        <div id="hero" className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                Studio Vip
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Oferecemos uma solução ideal para empreendedores. Esta plataforma permite o agendamento online e possui um sistema financeiro, facilitando a gestão de horários e melhorando a experiência do cliente.
              </p>
              <Link href="/products">
                <Button id="start-journey" size="lg" className="w-full md:w-fit gap-2">
                  <Sparkles className="w-4 h-4" />
                  Inicie sua jornada!
                </Button>
              </Link>
            </div>
            <Image
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              height="550"
              src="/ata.png"
              width="550"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-24 flex justify-center flex-col">
            <h1 className="font-bold text-4xl md:text-6xl w-full text-center text-wrap">
              Agradecemos por escolher-nos.
            </h1>

            <p className="font-medium text-center mt-4 mx-4">
              Agendamento e gestão financeira para empreendedores com excelência
              e serviços personalizados de qualidade superior.
            </p>
          </section>

          <section className="grid grid-cols-1 place-items-center md:flex lg:flex items-center justify-center mt-12 mx-9 gap-6 ">
            <Card className="w-80">
              <CardHeader>
                <SparkleIcon />
                <CardTitle>Loja Virtual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="w-40">
                  {" "}
                  Uma loja virtual integrada permite a venda de produtos e
                  oferece novas oportunidades de receita e crescimento orgânico
                  para empreendedores
                </p>
              </CardContent>
            </Card>

            <Card className="w-80">
              <CardHeader>
                <SparkleIcon />
                <CardTitle>Agendamento Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="w-40">
                  {" "}
                  O agendamento de serviços é facilitado, permitindo que os
                  clientes escolham horários e serviços diretamente na agenda
                  dos profissionais com poucos cliques.
                </p>
              </CardContent>
            </Card>

            <Card className="w-80">
              <CardHeader>
                <SparkleIcon />
                <CardTitle>Controle Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="w-40">
                  {" "}
                  Oferece uma área financeira intuitiva para organizar gastos e
                  ganhos, além de uma função exclusiva para declarar o imposto
                  de renda.
                </p>
              </CardContent>
            </Card>

            <Card className="w-80">
              <CardHeader>
                <SparkleIcon />
                <CardTitle>Marketing Integrado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="w-40">
                  {" "}
                  Impulsionar o negócio é simples com a Studio VIP, que oferece
                  ferramentas de marketing para criar materiais promocionais e
                  anúncios atraentes.
                </p>
              </CardContent>
            </Card>
          </section>

      <section id="popular-brands" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Empresas Populares que Confiam em Nós</h2>
          {loading ? (
            <p className="text-center">Carregando dados...</p>
          ) : (
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {empresas.length > 0 ? (
                  empresas.map((empresa) => (
                    <CarouselItem key={empresa.id} className="md:basis-1/3 lg:basis-1/4">
                      <div className="p-1">
                      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={empresa.ambient_photo || '/Empresa.jpg'}
                      alt={empresa.company_name || 'Imagem da empresa'}
                      width={300}
                      height={150}
                      className="w-full h-36 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-bold mb-1 truncate">{empresa.company_name || 'Nome da Empresa'}</CardTitle>
                    <div className="flex items-center mb-2 text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <p className="text-xs truncate">{empresa.address || 'Endereço não disponível'}</p>
                    </div>
                    <div className="flex items-center mb-3">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={empresa.logo || '/placeholder.svg?height=40&width=40'} alt="Avatar do proprietário" />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-primary ml-1">5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <p className="text-center">Nenhuma empresa encontrada.</p>
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      </section>


      <section id="help-section" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-center">
              Alguma dúvida? Nós te ajudamos!
            </h2>
            <div className="flex w-full max-w-sm items-center gap-2">
              <SearchInputWithIcon>
                <Mail className="w-4 h-4" />
              </SearchInputWithIcon>
              <Button>Enviar</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
