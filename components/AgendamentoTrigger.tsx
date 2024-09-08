"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from "react";
import { useToast } from "./ui/use-toast";

export default function AgendamentoTrigger({
  children,
  empresaId,
  servico,
}: {
  children: React.ReactNode;
  empresaId: number; // Recebe o ID da empresa
  servico: string;   // Recebe o nome do serviço
}) {
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { toast } = useToast();

  // Validação dos campos de forma mais direta
  const camposPreenchidos = () => {
    return name && telefone && date && time; // Verificação simples
  };

  const handleSubmit = async () => {
    // Log dos valores antes da validação
    console.log('Nome:', name, 'Telefone:', telefone, 'Data:', date, 'Hora:', time);

    // Verifica se os campos obrigatórios estão preenchidos corretamente
    if (!camposPreenchidos()) {
      toast({ title: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    // Combina a data e a hora no formato correto
    const dataHora = `${date}T${time}:00`;

    const userId = 1; // Substitua pelo ID real do usuário autenticado.

    // Dados do agendamento
    const agendamento = {
      empresa_id: empresaId,
      user_id: userId,
      data_hora: dataHora,
      servico: servico,
      nome: name,
      telefone: telefone,
    };

    console.log('Enviando agendamento:', agendamento);

    try {
      // Enviando dados para a API de agendamento
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamento),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Agendamento realizado com sucesso:', data);
        toast({ title: "Agendamento realizado com sucesso!" });
      } else {
        console.log('Erro na API:', data);
        toast({ title: `Erro: ${data.error}`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Erro ao realizar o agendamento:', error);
      toast({ title: "Erro ao realizar o agendamento.", variant: "destructive" });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agendamento</SheetTitle>
          <SheetDescription>
            Preencha o formulário abaixo para escolher uma data e horário
            conveniente para sua consulta. Garantimos um atendimento rápido e
            eficiente.
          </SheetDescription>
        </SheetHeader>
        <section className="grid gap-4 py-4">
          {/* Nome do cliente */}
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </section>

          {/* Telefone do cliente */}
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tel" className="text-right">
              Telefone
            </Label>
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

          {/* Data do agendamento */}
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <Input
              id="date"
              className="col-span-3"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </section>

          {/* Hora do agendamento */}
          <section className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Horário
            </Label>
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

        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
            >
              Agendar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}