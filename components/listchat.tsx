import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search } from "lucide-react";
import Link from "next/link";

interface Agendamento {
  id: number;
  cliente: string;
  email: string;
  data_hora: string;
  servico: string;
  photo?: string; // Opcional, caso tenha a foto
}

export default function Agenda() {
  const [isOpen, setIsOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar agendamentos com base no termo de pesquisa
  const filteredAgendamentos = agendamentos.filter((agendamento) =>
    agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token_empresa = sessionStorage.getItem("token_empresa");
        if (!token_empresa) {
          return; // Retornar se não houver token
        }

        const response = await fetch("/api/conversas", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token_empresa}`,
          },
          credentials: "include",
        });

        // Verifica o status da resposta
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao buscar agendamentos:", errorData);
          return; // Retornar se a resposta não for ok
        }

        const data: Agendamento[] = await response.json();
        console.log("Agendamentos recebidos:", data); // Log dos agendamentos recebidos
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    };

    fetchAgendamentos();
  }, []);

  return (
    <div className="p-4">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="flex items-center cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Contatos</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar contatos"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            {filteredAgendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conversa encontrada.
              </p>
            ) : (
              filteredAgendamentos.map((agendamento) => (
                <Link
                  key={agendamento.id}
                  href={`/chat/${agendamento.id}`}
                  passHref
                >
                  <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                    <Avatar>
                      <AvatarImage
                        src={agendamento.photo}
                        alt={agendamento.cliente}
                      />
                      <AvatarFallback>
                        {agendamento.cliente.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {agendamento.cliente}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {agendamento.servico} -{" "}
                        {new Date(agendamento.data_hora).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
