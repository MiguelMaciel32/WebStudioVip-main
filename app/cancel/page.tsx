'use client'

import { XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation';


export default function Component() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Pagamento Recusado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no Pagamento</AlertTitle>
            <AlertDescription>
              Não foi possível processar o seu pagamento. Por favor, verifique os dados do seu cartão ou escolha outro método de pagamento.
            </AlertDescription>
          </Alert>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Possíveis motivos:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Saldo insuficiente</li>
              <li>Cartão expirado</li>
              <li>Dados do cartão incorretos</li>
              <li>Transação bloqueada pelo banco</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
          
          onClick={() => router.push('/')}
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar e Tentar Novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}