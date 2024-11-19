"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bot, Image, Send } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { model } from "@/utils/GeminiUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export default function ChatIA() {
  const [userPromptValue, setUserPromptValue] = useState<string>("");
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const formatBoldText = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  const fileToBase64 = (file: File): Promise<ImagePart> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        resolve({
          inlineData: {
            data: base64Data.split(",")[1],
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const run = async (userPrompt: string): Promise<void> => {
    if (!userPrompt.trim()) return;

    let imagePart: ImagePart[] = [];

    if (uploadedImage) {
      imagePart = [await fileToBase64(uploadedImage)];
    }

    const contextPrompt = `
      Você foi criado como parte de um TCC chamado Studio VIP 2024, desenvolvido por 5 alunos para ajudar pessoas com problemas capilares e com foco em cuidados de cabelo, spa, e tatuagens. 
      Você só deve responder perguntas sobre esses temas. 
      Se a pergunta for sobre outro assunto, responda: "Desculpe, eu só posso responder perguntas relacionadas a cabelo, spa e tatuagens."
      Sempre responda em português (PT-BR).
      Se alguém perguntar o que é o Studio VIP, responda: "O Studio VIP é um site onde você pode realizar agendamentos automáticos com salões próximos a você, focado em serviços de beleza como cabelo, spa, e tatuagem."
    `;

    try {
      let result;

      if (imagePart.length > 0) {
        result = await model.generateContent([contextPrompt, userPrompt, ...imagePart]);
      } else {
        result = await model.generateContent([contextPrompt, userPrompt]);
      }

      const response = await result.response;
      const text = await response.text();
      const formattedText = formatBoldText(text);
      setGeminiResponse(formattedText);
      setUserPromptValue("");
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setGeminiResponse("Desculpe, houve um erro ao processar sua solicitação.");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      run(userPromptValue);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 size-12 rounded-full flex justify-center items-center"
          onClick={() => setIsOpen(true)}
        >
          <Bot size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-[425px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>StudioVip I.A</SheetTitle>
          <SheetDescription>
            Uma inteligência artificial especializada em beleza capilar.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="flex-grow mb-4">
          {geminiResponse && (
            <div className="bg-primary/10 p-4 rounded-lg mb-4">
              <h2 
                className="text-sm text-primary"
                dangerouslySetInnerHTML={{ __html: geminiResponse }}
              />
            </div>
          )}
          {uploadedImage && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Imagem carregada:</p>
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Pré-visualização da imagem"
                className="max-w-full h-auto max-h-64 object-contain border rounded"
              />
            </div>
          )}
        </ScrollArea>
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={userPromptValue}
            onChange={(e) => setUserPromptValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida..."
            className="flex-grow resize-none"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={18} />
            </Button>
            <Button
              size="icon"
              onClick={() => run(userPromptValue)}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </SheetContent>
    </Sheet>
  );
}