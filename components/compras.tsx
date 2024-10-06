'use client'

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Calendar, Building2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Compra {
  id: number
  data_hora: string
  nome: string
  empresa: string
}

export default function UltimasCompras() {
  const [open, setOpen] = useState(false)
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompras = async () => {
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

        const data: Compra[] = await response.json()
        setCompras(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCompras()
  }, [])

  const formatarData = (dataHora: string) => {
    const [data, hora] = dataHora.split('T')
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + hora.slice(0, 5)
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

    if (compras.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma compra encontrada</AlertTitle>
          <AlertDescription>Você ainda não realizou nenhuma compra.</AlertDescription>
        </Alert>
      )
    }

    return compras.map((compra, index) => (
      <div key={compra.id} className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{compra.nome}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <Building2 className="w-4 h-4 mr-2" />
              {compra.empresa}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground flex items-center justify-end">
              <Calendar className="w-4 h-4 mr-2" />
              {formatarData(compra.data_hora)}
            </p>
          </div>
        </div>
        {index < compras.length - 1 && <Separator className="my-4" />}
      </div>
    ))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer ml-2 ">
          <ShoppingCart className="w-4 h-4" />
          Serviços Agendados
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6" />
            Últimas Compras
          </SheetTitle>
          <SheetDescription>
            Aqui estão suas transações mais recentes.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] mt-6 rounded-md border p-4">
          {renderContent()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}