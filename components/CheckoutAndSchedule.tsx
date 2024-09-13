import { useState } from 'react';
import { Button } from '@/components/ui/button';

const CheckoutAndSchedule: React.FC<{ empresaId: number; servico: string; price: number }> = ({ empresaId, servico, price }) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const result = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: servico, // Atualizado para o nome do serviço
          price, // Usando o valor passado como prop
          quantity: 1,
        }),
      });
      const data = await result.json();
      setPreferenceId(data.id);

      // Redirect the user to the Mercado Pago checkout
      if (data.id) {
        window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async () => {
    try {
      const result = await fetch('/api/schedule-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          user_id: 1, // Replace with actual user ID
          data_hora: new Date().toISOString(),
          servico,
          nome: 'User Name', // Replace with actual user name
          telefone: '1234567890', // Replace with actual phone number
        }),
      });
      const data = await result.json();
      console.log('Agendamento realizado com sucesso!', data);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  return (
    <div>
      <Button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Checkout'}
      </Button>
      {preferenceId && (
        <></>
      )}
    </div>
  );
};

export default CheckoutAndSchedule;