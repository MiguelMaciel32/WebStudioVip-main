'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function handlePaymentSuccess() {
      const collectionId = searchParams.get('collection_id');
      const status = searchParams.get('status');
      const externalReference = searchParams.get('external_reference');
      const paymentId = searchParams.get('payment_id');

      if (!collectionId || !status || !paymentId || !externalReference) {
        setError('Parâmetros ausentes.');
        setLoading(false);
        return;
      }

      if (status !== 'approved') {
        setError('O pagamento não foi aprovado.');
        setLoading(false);
        return;
      }

      try {
        // Verificar e codificar externalReference
        const encodedExternalReference = encodeURIComponent(externalReference);

        // Atualize a URL do fetch para o endpoint correto
        const url = `/api/suce?collection_id=${collectionId}&status=${status}&external_reference=${encodedExternalReference}&payment_id=${paymentId}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('Agendamento realizado com sucesso!');
        } else {
          setError(data.error || 'Erro ao realizar agendamento.');
        }
      } catch (err) {
        setError('Erro ao se comunicar com a API.');
      } finally {
        setLoading(false);
      }
    }

    handlePaymentSuccess();
  }, [searchParams]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Pagamento {error ? 'Falhou' : 'Aprovado'}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{error ? error : message}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => router.push('/')} className="w-full">
            Voltar para a Loja
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
