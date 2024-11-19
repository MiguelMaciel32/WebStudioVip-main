"use client"

import { useState, useRef, useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bot, ImageIcon, Send, X } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { model } from "@/utils/GeminiUtils"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react';

interface ImagePart {
  inlineData: {
    data: string
    mimeType: string
  }
}


export default function ChatIA() {
  const [userPromptValue, setUserPromptValue] = useState<string>("")
  const [geminiResponse, setGeminiResponse] = useState<string>("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const formatBoldText = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  }

  const fileToBase64 = (file: File): Promise<ImagePart> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Data = reader.result as string
        resolve({
          inlineData: {
            data: base64Data.split(",")[1],
            mimeType: file.type,
          },
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const run = async (userPrompt: string): Promise<void> => {
    try {
      setIsLoading(true);
      let imagePart: ImagePart[] = []

      if (uploadedImage) {
        imagePart = [await fileToBase64(uploadedImage)]
      }

      const contextPrompt = `
        Você foi criado como parte de um TCC chamado Studio VIP 2024, desenvolvido por 5 alunos para ajudar pessoas com problemas capilares e com foco em cuidados de cabelo, spa, e tatuagens. 
        Você só deve responder perguntas sobre esses temas. 
        Se a pergunta for sobre outro assunto, responda: "Desculpe, eu só posso responder perguntas relacionadas a cabelo, spa e tatuagens."
        Sempre responda em português (PT-BR).
        Se alguém perguntar o que é o Studio VIP, responda: "O Studio VIP é um site onde você pode realizar agendamentos automáticos com salões próximos a você, focado em serviços de beleza como cabelo, spa, e tatuagem."
      `

      let result

      if (imagePart.length > 0) {
        result = await model.generateContent([contextPrompt, userPrompt, ...imagePart])
      } else {
        result = await model.generateContent([contextPrompt, userPrompt])
      }

      const response = await result.response
      const text = await response.text()
      const formattedText = formatBoldText(text)
      setGeminiResponse(formattedText)
      setUserPromptValue("")
      setUploadedImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Erro ao obter resposta:", error)
      toast({
        title: "Erro",
        description: "Houve um erro ao processar sua solicitação. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      run(userPromptValue)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <section className="fixed bottom-2 right-2 size-12 rounded-full flex justify-center items-center bg-primary ">
          <Bot size={32} className="text-primary-foreground" />
        </section>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>StudioVip I.A</SheetTitle>
          <SheetDescription>é uma inteligência artificial especializada em beleza capilar.</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <section className="h-[calc(100vh-200px)] flex flex-col">
          <section className="flex-1 overflow-y-auto space-y-4 mb-4">
            {geminiResponse && (
              <section className="bg-primary p-4 rounded-lg max-w-[80%] text-primary-foreground">
                <h2 dangerouslySetInnerHTML={{ __html: geminiResponse }} />
              </section>
            )}
          </section>
          <section className="flex flex-col gap-4">
            <Textarea
              value={userPromptValue}
              onChange={(e) => setUserPromptValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida..."
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                <ImageIcon className="mr-2 h-4 w-4" />
                {uploadedImage ? "Trocar imagem" : "Adicionar imagem"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button onClick={() => run(userPromptValue)} disabled={isLoading || (!userPromptValue.trim() && !uploadedImage)}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Enviando</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Enviar
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
          {uploadedImage && (
            <section className="mt-4 relative">
              <p>Imagem carregada:</p>
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Pré-visualização da imagem"
                className="max-w-xs max-h-64 object-contain border rounded"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </section>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}