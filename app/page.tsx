'use client'

import { useEffect, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SparkleIcon, Sparkles, Mail, MapPin, Star, Loader2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
} from "@/components/ui/carousel"
import SearchInputWithIcon from "@/components/Input-Icon"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Empresa {
  id: number
  company_name: string
  address: string
  logo: string | null
  ambient_photo: string | null
  total_agendamentos: number
}

export default function Component() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showTutorial, setShowTutorial] = useState<boolean>(false)

  useEffect(() => {
    const tutorial = localStorage.getItem('tutorial')
    if (!tutorial) {
      setShowTutorial(true)
    }

    const fetchEmpresas = async () => {
      try {
        const response = await fetch("https://us-central1-scadaiot-c8a2b.cloudfunctions.net/empresastop")
        if (!response.ok) {
          throw new Error('Falha na requisição')
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setEmpresas(data)
        } else {
          console.error("A resposta da API não contém um array de empresas.")
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresas()

    if (showTutorial) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { element: '#hero', popover: { title: 'Bem-vindo ao Studio VIP', description: 'Aqui você pode achar salões para sua beleza com facilidade.' } },
          { element: '#start-journey', popover: { title: 'Comece sua jornada', description: 'Clique aqui para criar sua conta e começar a usar o Studio VIP.' } },
          { element: '#popular-brands', popover: { title: 'Marcas Populares', description: 'Conheça algumas das marcas que confiam em nossos serviços.' } },
          { element: '#help-section', popover: { title: 'Precisa de ajuda?', description: 'Entre em contato conosco se tiver alguma dúvida.' } },
        ]
      })

      driverObj.drive()
      localStorage.setItem('tutorial', 'true')
      setShowTutorial(false)
    }
  }, [showTutorial])

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <section id="hero" className="w-full py-8 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Studio VIP
              </h1>
              <p className="text-muted-foreground md:text-lg">
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
              height="400"
              src="https://firebasestorage.googleapis.com/v0/b/studiovip-6913f.appspot.com/o/ata.jpg?alt=media&token=3d16f8a6-ed28-422a-80ed-a1270c192b80"
              width="400"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-12 flex justify-center flex-col">
        <h2 className="font-bold text-3xl md:text-4xl w-full text-center">
          Agradecemos por nos escolher.
        </h2>
        <p className="font-medium text-center mt-2 mx-4 text-sm md:text-base">
          Agendamento e gestão financeira para empreendedores com excelência e serviços personalizados de qualidade superior.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mx-4">
        {[
          { title: "Loja Virtual", desc: "Uma loja virtual integrada permite a venda de produtos e oferece novas oportunidades de receita e crescimento orgânico para empreendedores" },
          { title: "Agendamento Online", desc: "O agendamento de serviços é facilitado, permitindo que os clientes escolham horários e serviços diretamente na agenda dos profissionais com poucos cliques." },
          { title: "Controle Financeiro", desc: "Oferece uma área financeira intuitiva para organizar gastos e ganhos, além de uma função exclusiva para declarar o imposto de renda." },
          { title: "Marketing Integrado", desc: "Impulsionar o negócio é simples com a Studio VIP, que oferece ferramentas de marketing para criar materiais promocionais e anúncios atraentes." }
        ].map((item, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <SparkleIcon className="w-5 h-5" />
              <CardTitle className="text-sm md:text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="popular-brands" className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-bold text-center mb-6">Empresas Populares que Confiam em Nós</h2>
          {loading ? (
           <div className="flex justify-center items-center h-64">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
          ) : (
            <Carousel className="w-full max-w-6xl mx-auto">
              <CarouselContent>
                {empresas.length > 0 ? (
                  empresas.map((empresa) => (
                    <Link key={empresa.id} href={`/sobreempresa/${empresa.id}`}>
                    <CarouselItem key={empresa.id} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg mx-auto">
                        <CardHeader className="p-0 relative">
                          <Image
                            src={empresa.ambient_photo || '/Empresa.jpg'}
                            alt={empresa.company_name || 'Imagem da empresa'}
                            width={400}
                            height={200}
                            className="w-full h-40 object-cover"
                          />
                        </CardHeader>
                        <CardContent className="p-4">
                          <CardTitle className="text-base font-bold mb-2 truncate">{empresa.company_name || 'Nome da Empresa'}</CardTitle>
                          <div className="flex items-center mb-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <p className="text-sm truncate">{empresa.address || 'Endereço não disponível'}</p>
                          </div>
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 mr-2">
                              <AvatarImage src={empresa.logo || '/placeholder.svg?height=32&width=32'} alt="Avatar do proprietário" />
                              <AvatarFallback>P</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center">
                              <Star size={16} className="text-yellow-400" />
                              <span className="text-sm font-semibold text-primary ml-1">5.0</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    </Link>
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

      
    </main>
  )
}