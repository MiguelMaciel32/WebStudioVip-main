'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparkleIcon, Sparkles, StarsIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
} from "@/components/ui/carousel";
import SearchInputWithIcon from "@/components/Input-Icon";
import { Mail } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import AssinaturaComponent from "../components/assinatura";
import listchat from "../components/listchat";
import Agenda from "../components/listchat";

export default function Home() {
  return (
    <>
      <main className="flex flex-col">
        <section className="w-full py-12 md:py-24 lg:py-1">
          <section className="container grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
            <Image
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              height="550"
              src="/ata.png"
              width="550"
            />
            <section className="flex flex-col justify-center space-y-4 ">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                Studio Vip
              </h1>
              <h5>
                Oferecemos uma solução ideal para empreendedores. Esta
                plataforma permite o agendamento online e possui um sistema
                financeiro, facilitando a gestão de horários e melhorando a
                experiência do cliente.
              </h5>
              <Link href="/products">
                <Button className="w-full md:w-fit gap-2 mt-4 items-center">
                  <Sparkles size={16} />
                  Inicie sua jornada!
                </Button>
              </Link>
            </section>
          </section>
          <section>
          </section>
          <section className="grid mt-40 mx-9 grid-cols-1 md:grid-cols-2">
            <Image
              className="rounded-lg shadow-md aspect-video"
              alt="Cabelos Image Maquiagem Agendamento"
              height="550"
              src="/ServuicoStudioVip.jpg"
              width="550"
            />
            <section className="">
              <h1 className="font-bold  text-4xl my-4 w-full text-center md:text-start">
                Agendamento Online
              </h1>
              <p className="mt-2 text-muted-foreground ">
                Proporcionamos aos clientes acesso direto à agenda dos
                profissionais, simplificando o agendamento de serviços. Com esta
                funcionalidade, os usuários podem visualizar os horários
                disponíveis para atendimento e selecionar o serviço desejado de
                forma conveniente e rápida
              </p>
              <section className="flex gap-7 mt-8 justify-center items-center md:justify-start">
                <section className="flex items-center justify-center flex-col ">
                  <h2 className="font-bold text-2xl md:text-4xl ">8k+</h2>
                  <p className="font-bold">Clientes</p>
                </section>
                <section className="flex items-center justify-center flex-col">
                  <h2 className="font-bold text-2xl md:text-4xl ">6k+</h2>
                  <p className="font-bold">Produtos </p>
                </section>
                <section className="flex items-center justify-center flex-col">
                  <h2 className="font-bold text-2xl md:text-4xl ">2k+</h2>
                  <p className="font-bold">Empresas</p>
                </section>
              </section>
            </section>
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
          <section className="flex justify-center px-6 mt-10">
            <h1 className="font-bold text-2xl text-center">
              Alguma dúvida? Nós te ajudamos!
            </h1>
          </section>

          <section className="flex justify-center gap-3 my-4">
            <SearchInputWithIcon>
              <Mail />
            </SearchInputWithIcon>
            <Button>Enviar</Button>
          </section>
        </section>
      </main>
    </>
  );
}