'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Building2 } from "lucide-react"


interface Compra {
  id: number
  servico: string
  preco: number
  data_hora: string
  empresa: string
}

export default function UltimasCompras() {
  const [compras, setCompras] = useState<Compra[]>([]) 
  const [loading, setLoading] = useState(true)          
  const [error, setError] = useState<string | null>(null) 

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const token = sessionStorage.getItem('token');   

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

  if (loading) {
    return <p>Carregando...</p>
  }

  if (error) {
    return <p>Erro: {error}</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Suas Últimas Compras</h1>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {compras.length > 0 ? (
              compras.map((compra) => (
                <div key={compra.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{compra.servico}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      {compra.data_hora.split(' ')[0]} {/* Exibe apenas a data */}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4" />
                      {compra.data_hora.split(' ')[1]} {/* Exibe apenas a hora */}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {compra.empresa}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Você ainda não realizou nenhuma compra.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
