'use client'
import { Clock, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation';


export default function PaymentPending() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-yellow-100 rounded-full p-3 w-fit">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Pagamento Pendente</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-center mb-2">
              <RefreshCw className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aguardando Confirmação</h3>
            <p className="text-sm text-gray-600">
              Estamos verificando seu pagamento com a instituição financeira. Por favor, aguarde.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="outline" onClick={() => router.push('/')} className="w-full">
            Voltar para a Loja
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}