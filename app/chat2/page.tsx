'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

type Message = {
  id: number;
  agendamento_id: number;
  user_id: number;
  mensagem: string;
  data_hora: string;
};

type User = {
  id: number;
  profile_picture: string;
  nome: string;
};

interface Agendamento {
  id: number;
  cliente: string;
  email: string;
  data_hora: string;
  servico: string;
  photo?: string;
}

export default function TechPulseChat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const router = useRouter();


  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token_empresa = sessionStorage.getItem("token_empresa");
        if (!token_empresa) {
          router.push('/login');
          return;
        }

        const response = await fetch("/api/conversas", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token_empresa}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao buscar agendamentos:", errorData);
          return;
        }

        const data: Agendamento[] = await response.json();
        console.log("Agendamentos recebidos:", data);
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    };

    fetchAgendamentos();
  }, [router]);

  const fetchChatData = async (agendamento: Agendamento) => {
    try {
      const token_empresa = sessionStorage.getItem('token_empresa');
      if (!token_empresa) {
        router.push('/login');
        return;
      }

      setSelectedAgendamento(agendamento); // Atualiza o agendamento selecionado
      setMessages([]); // Limpa mensagens ao selecionar um novo agendamento

      const response = await fetch(`/api/chat?id=${agendamento.id}`, {
        headers: {
          'Authorization': `Bearer ${token_empresa}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data.error);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setMessages(data.mensagens); // Carrega mensagens ao selecionar o agendamento
    } catch (error) {
      console.error('Erro ao buscar dados do chat:', error);
    }
  };

  // Função para enviar uma nova mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() && user && selectedAgendamento) {
      const message: Message = {
        id: messages.length + 1,
        agendamento_id: selectedAgendamento.id,
        user_id: user.id,
        mensagem: newMessage,
        data_hora: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");

      try {
        const token_empresa = sessionStorage.getItem('token_empresa');
        if (!token_empresa) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/enviarmsgempresa`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token_empresa}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agendamento_id: selectedAgendamento.id,
            mensagem: newMessage,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Erro ao enviar mensagem:", data.error);
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    }
  };

  const filteredAgendamentos = agendamentos.filter((agendamento) =>
    agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar de agendamentos */}
      <div className="w-1/3 bg-white border-r">
        <div className="p-4">
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-112px)]">
          {filteredAgendamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Nenhuma conversa encontrada.</p>
          ) : (
            filteredAgendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className={`flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-4 transition ${
                  selectedAgendamento?.id === agendamento.id ? 'bg-gray-200' : ''
                }`}
                onClick={() => fetchChatData(agendamento)}
              >
                <Avatar>
                  <AvatarImage src={agendamento.photo || "/placeholder.svg?height=40&width=40"} alt={agendamento.cliente} />
                  <AvatarFallback>{agendamento.cliente.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{agendamento.cliente}</p>
                  <p className="text-sm text-muted-foreground">
                    {agendamento.servico} - {new Date(agendamento.data_hora).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      <div className="flex-1 flex flex-col">
        <header className="bg-white p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{selectedAgendamento?.cliente || "Selecione um Cliente"}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-700">Esta conversa está sendo monitorada para fins de qualidade e treinamento.</p>
          </div>

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.user_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`flex ${message.user_id === user?.id ? "flex-row-reverse" : "flex-row"} items-end`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_picture || "/placeholder.svg?height=32&width=32"} alt={user?.nome || "User"} />
                  <AvatarFallback>{user?.nome?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className={`mx-2 ${message.user_id === user?.id ? "bg-blue-500 text-white" : "bg-gray-200"} rounded-lg p-3 max-w-xs`}>
                  <p>{message.mensagem}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="bg-white p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!selectedAgendamento}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
}
