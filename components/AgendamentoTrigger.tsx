import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AgendamentoTrigger({
  children,
  empresaId,
  servico,
  precoServico,
}: {
  children: React.ReactNode;
  empresaId: number;
  servico: string;
  precoServico: number;
}) {
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const camposPreenchidos = () => name && telefone && date && time;
  const telefoneValido = (telefone: string) => /^\(?\d{2}\)?[\s-]?[\s9]?\d{4}-?\d{4}$/.test(telefone);

  const handleGeneratePayment = async () => {
    if (!camposPreenchidos() || !telefoneValido(telefone)) {
      toast({ title: "Por favor, preencha todos os campos corretamente.", variant: "destructive" });
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast({ title: "Você precisa estar logado para realizar o agendamento.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const dataHora = `${date}T${time}:00`;

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          description: servico,
          price: precoServico,
          quantity: 1,
          empresaId,
          servico,
          pagamento_id: `pagamento_${Date.now()}` // Gerar um pagamento_id único
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
      } else {
        toast({ title: `Erro: ${data.error}`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Erro ao gerar o pagamento:', error);
      toast({ title: "Erro ao gerar o pagamento.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agendamento</SheetTitle>
          <SheetDescription>
            Preencha o formulário abaixo para gerar o pagamento via Mercado Pago. Após o pagamento, o agendamento será confirmado automaticamente.
          </SheetDescription>
        </SheetHeader>
        <section className="grid gap-4 py-4">
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Luis Miguel"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </section>
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tel" className="text-right">Telefone</Label>
            <Input
              id="tel"
              className="col-span-3"
              placeholder="+55 (**) *********"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </section>
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data</Label>
            <Input
              id="date"
              className="col-span-3"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </section>
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Horário</Label>
            <Input
              id="time"
              className="col-span-3"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </section>
        </section>
        <div className="py-4">
          <Button onClick={handleGeneratePayment} disabled={loading}>
            {loading ? "Gerando pagamento..." : "Gerar Pagamento"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
