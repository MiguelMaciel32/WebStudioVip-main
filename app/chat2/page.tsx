'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from 'lucide-react';

type Message = {
  id: number;
  mensagem: string;
  data_hora: string;
  user_id: number | null;
};

type User = {
  id: number;
  name: string;
  profile_picture: string | null;
};

interface Agendamento {
  id: number;
  cliente: string;
  email: string;
  data_hora: string;
  servico: string;
  photo?: string;
}

interface ApiResponse {
  user: User;
  mensagens: Message[];
}

export default function TechPulseChat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [companyUserId, setCompanyUserId] = useState<number | null>(null);
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

    const fetchCompanyUserId = async () => {
      try {
        const token_empresa = sessionStorage.getItem("token_empresa");
        if (!token_empresa) {
          router.push('/login');
          return;
        }

        const response = await fetch("/api/company-user-id", {
          headers: {
            Authorization: `Bearer ${token_empresa}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company user ID');
        }

        const data = await response.json();
        setCompanyUserId(data.userId);
      } catch (error) {
        console.error('Error fetching company user ID:', error);
      }
    };

    fetchCompanyUserId();
  }, [router]);

  const fetchChatData = async (agendamento: Agendamento) => {
    try {
      const token_empresa = sessionStorage.getItem('token_empresa');
      if (!token_empresa) {
        router.push('/login');
        return;
      }

      setSelectedAgendamento(agendamento);
      setMessages([]);

      const response = await fetch(`api/chat?id=${agendamento.id}`, {
        headers: {
          'Authorization': `Bearer ${token_empresa}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao buscar dados do chat:", errorData.error);
        return;
      }

      const data: ApiResponse = await response.json();
      setUser(data.user);
      setMessages(data.mensagens);
    } catch (error) {
      console.error('Erro ao buscar dados do chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && companyUserId && selectedAgendamento) {
      const message: Message = {
        id: messages.length + 1,
        mensagem: newMessage,
        data_hora: new Date().toISOString(),
        user_id: companyUserId,
      };
  
      // Adicionar a nova mensagem localmente
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage(""); // Limpar a caixa de mensagem
  
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
            agendamento_id: selectedAgendamento.id,  // Passar o ID correto
            mensagem: newMessage,  // Passar a mensagem corretamente
          }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          console.error("Erro ao enviar mensagem:", data.error);
        } else {
          console.log("Mensagem enviada com sucesso:", data);
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    } else {
      console.log('Mensagem vazia ou agendamento não selecionado');
    }
  };
  
  
  

  const filteredAgendamentos = agendamentos.filter((agendamento) =>
    agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
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

          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Nenhuma mensagem encontrada.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.user_id === companyUserId ? "justify-end" : "justify-start"}`}>
                <div className={`flex ${message.user_id === companyUserId ? "flex-row-reverse" : "flex-row"} items-end`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={message.user_id === companyUserId ? (user?.profile_picture || "/placeholder.svg?height=32&width=32") : (selectedAgendamento?.photo || "/placeholder.svg?height=32&width=32")} 
                      alt={message.user_id === companyUserId ? (user?.name || "Company") : (selectedAgendamento?.cliente || "Client")} 
                    />
                    <AvatarFallback>{message.user_id === companyUserId ? (user?.name?.[0] || "C") : (selectedAgendamento?.cliente?.[0] || "U")}</AvatarFallback>
                  </Avatar>
                  <div className={`mx-2 ${message.user_id === companyUserId ? "bg-blue-500 text-white" : "bg-gray-200"} rounded-lg p-3 max-w-xs`}>
                    <p>{message.mensagem}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="bg-white p-4 border-t">
  <div className="flex items-center space-x-2">
    <Button
      type="button"
      onClick={handleSendMessage}  
      className="flex-shrink-0"
      disabled={!selectedAgendamento || !newMessage.trim()}
    >
      <Send className="h-5 w-5" />
    </Button>
    <Input
      type="text"
      placeholder="Digite uma mensagem..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      className="flex-1"
    />
  </div>
</footer>
      </div>
    </div>
  );
}