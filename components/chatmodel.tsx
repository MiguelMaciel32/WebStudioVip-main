'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MoreVertical, Send } from "lucide-react"

type Message = {
  id: number
  content: string
  sender: "user" | "contact"
  timestamp: string
}

interface User {
  id: number
  name: string
  foto: string
}

interface ChatModalProps {
  id: string;
  onClose: () => void; // Função para fechar o modal
}

export default function ChatModal({ id, onClose }: ChatModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const fetchChatData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/chat?id=${id}`)
          const data = await response.json()

          if (response.ok) {
            setUser(data.user)
            const fetchedMessages: Message[] = data.mensagens.map((msg: any) => ({
              id: msg.id,
              content: msg.mensagem,
              sender: msg.user_id === user?.id ? "user" : "contact",
              timestamp: new Date(msg.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
            setMessages(fetchedMessages)
          } else {
            console.error(data.error)
          }
        } catch (error) {
          console.error('Erro ao buscar dados do chat:', error)
        }
      }
    }

    fetchChatData()
  }, [id, user?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages([...messages, message])
      setNewMessage("")

      try {
        const token_empresa = sessionStorage.getItem('token_empresa')
        if (!token_empresa) {
          router.push('/login')
          return
        }
        const response = await fetch(`/api/enviarmsgempresa`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token_empresa}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agendamento_id: id, 
            mensagem: newMessage,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("Erro ao enviar mensagem:", data.error)
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error)
      }
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Fechar</span>
            </Button>
            {user && (
              <Avatar>
                <AvatarImage src={user.foto || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="font-semibold">{user?.name || "Carregando..."}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Mais opções</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "contact" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "contact" ? "bg-[#50555b] text-white" : "bg-[#f0f0f0] text-black"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 max-w-3xl mx-auto">
            <Input
              type="text"
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-5 w-5" />
              <span className="sr-only">Enviar mensagem</span>
            </Button>
          </form>
        </footer>
      </div>
    </div>
  )
}
