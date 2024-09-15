import { AlertCircle, ArrowRight, MessageCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentDeclined() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-red-100 rounded-full p-3 w-fit">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Pagamento Recusado</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Infelizmente, não foi possível processar seu pagamento. Por favor, verifique os detalhes do seu cartão e tente novamente.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-center mb-2">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verifique seu método de pagamento</h3>
            <p className="text-sm text-gray-600">
              Certifique-se de que as informações do seu cartão estão corretas e que há saldo suficiente para a transação.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full">
            Tentar Novamente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full">
            Contatar Suporte
            <MessageCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}