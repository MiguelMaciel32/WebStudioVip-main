'use client'

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Calendar, Building2, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Servico {
  id: number
  data_hora: string
  servico: string
  nome: string
  telefone: string
}

export default function ServicosAgendados() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const token = sessionStorage.getItem('token')

        const response = await fetch('/api/compras', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados")
        }

        const data: Servico[] = await response.json()
        setServicos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchServicos()
  }, [])

  const formatarData = (dataHora: string) => {
    const [data, hora] = dataHora.split('T')
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + hora.slice(0, 5)
  }

  const getStatusServico = (dataHora: string) => {
    const agora = new Date()
    const dataServico = new Date(dataHora)
    
    if (dataServico < agora) {
      return "Finalizado"
    } else {
      return "Agendado"
    }
  }

  const renderContent = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 mb-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (servicos.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum serviço encontrado</AlertTitle>
          <AlertDescription>Você ainda não agendou nenhum serviço.</AlertDescription>
        </Alert>
      )
    }

    return servicos.map((servico, index) => (
      <div key={servico.id} className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{servico.servico}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <Building2 className="w-4 h-4 mr-2" />
              {servico.nome}
            </p>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-2" />
              {formatarData(servico.data_hora)}
            </p>
          </div>
          <div className="text-right">
            <Badge 
              variant={getStatusServico(servico.data_hora) === "Finalizado" ? "secondary" : "default"}
              className="flex items-center"
            >
              {getStatusServico(servico.data_hora) === "Finalizado" ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <Clock className="w-4 h-4 mr-1" />
              )}
              {getStatusServico(servico.data_hora)}
            </Badge>
          </div>
        </div>
        {index < servicos.length - 1 && <Separator className="my-4" />}
      </div>
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShoppingCart className="w-8 h-8 mr-2" />
        Serviços Agendados
      </h1>
      <p className="text-muted-foreground mb-6">
        Aqui estão seus serviços agendados e histórico de cortes.
      </p>
      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border p-4">
        {renderContent()}
      </ScrollArea>
    </div>
  )
}