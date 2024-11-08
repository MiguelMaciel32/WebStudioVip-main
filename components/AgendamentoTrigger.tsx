import { useState } from 'react';
import { useToast } from './ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AgendamentoTriggerProps {
  children: React.ReactNode;
  empresaId: number;
  servico: string;
  precoServico: number;
  userId?: number;
}

export default function AgendamentoTrigger({
  children,
  empresaId,
  servico,
  precoServico,
  userId,
}: AgendamentoTriggerProps) {
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [errors, setErrors] = useState({
    name: '',
    telefone: '',
    date: '',
    time: '',
  });

  const camposPreenchidos = () => name && telefone && date && time;

  const telefoneValido = (telefone: string) => /^\(?\d{2}\)?[\s-]?[\s9]?\d{4}-?\d{4}$/.test(telefone);

  const validarCampos = () => {
    const newErrors = {
      name: name ? '' : 'O nome é obrigatório.',
      telefone: telefoneValido(telefone) ? '' : 'Número de telefone inválido.',
      date: date ? '' : 'A data é obrigatória.',
      time: time ? '' : 'O horário é obrigatório.',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const agendar = async () => {
    if (!validarCampos()) {
      toast({ title: "Por favor, corrija os erros e preencha todos os campos corretamente.", variant: "destructive" });
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast({ title: "Você precisa estar logado para realizar o agendamento.", variant: "destructive" });
      console.log('Erro: Token não encontrado no sessionStorage');
      return;
    }

    setLoading(true);
    const dataHora = `${date}T${time}:00`;

    try {
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          empresaId,
          servico,
          data_hora: dataHora,
          nome: name,
          telefone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Agendamento realizado com sucesso!", description: "Aguardando confirmação de pagamento." });
      } else {
        // Exibindo mensagens de erro específicas
        if (data.error === 'Não é possível agendar para uma data no passado.') {
          toast({ title: "Erro", description: "Essa data já passou.", variant: "destructive" });
        } else if (data.error === 'Este horário já está ocupado.') {
          toast({ title: "Erro", description: "Já existe um agendamento para essa data e hora.", variant: "destructive" });
        } else if (data.error === 'Número de telefone inválido.') {
          toast({ title: "Erro", description: "Número de telefone inválido.", variant: "destructive" });
        } else {
          toast({ title: "Erro desconhecido", description: "Erro ao processar o agendamento.", variant: "destructive" });
        }
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
          Preencha o formulário abaixo para que o agendamento seja confirmado automaticamente.
          </SheetDescription>
        </SheetHeader>
        <section className="grid gap-4 py-4">
          <section className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </section>
          <section className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              value={telefone} 
              onChange={(e) => setTelefone(e.target.value)} 
              disabled={loading}
            />
            {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
          </section>
          <section className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              disabled={loading}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </section>
          <section className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input 
              id="time" 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              disabled={loading}
            />
            {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
          </section>
          <Button onClick={agendar} disabled={loading || !camposPreenchidos()}>
            {loading ? 'Agendando....' : 'Agendar'}
          </Button>
        </section>
      </SheetContent>
    </Sheet>
  );
}
