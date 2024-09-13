"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bot, Image, Send } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { model } from "@/utils/GeminiUtils"; // Importa o modelo correto
import { useState, useRef } from "react";

// Define o tipo para a imagem
interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export default function ChatIA() {
  const [userPromptValue, setUserPromptValue] = useState<string>("");
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null); // Estado para a imagem
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para converter asteriscos em tags HTML <strong> para negrito
  const formatBoldText = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  // Função para converter imagem para Base64
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

  // Função para enviar a mensagem e obter a resposta da IA
  const run = async (userPrompt: string): Promise<void> => {
    let imagePart: ImagePart[] = [];

    // Se houver uma imagem, converte-a para Base64
    if (uploadedImage) {
      imagePart = [await fileToBase64(uploadedImage)];
    }

    // Definindo o contexto para o prompt
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
        // Se houver imagem, use generateContent
        result = await model.generateContent([contextPrompt, userPrompt, ...imagePart]);
      } else {
        // Se for apenas texto, use generateContent com o contexto
        result = await model.generateContent([contextPrompt, userPrompt]);
      }

      const response = await result.response;
      const text = await response.text();
      const formattedText = formatBoldText(text); // Formata o texto para negrito
      setGeminiResponse(formattedText);
      setUserPromptValue(""); // Limpa o campo de entrada de texto após o envio
      setUploadedImage(null); // Limpa a imagem após o envio
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Limpa o input de imagem
      }
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setGeminiResponse("Desculpe, houve um erro ao processar sua solicitação.");
    }
  };

  // Função para lidar com o upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file); // Armazena a imagem para envio
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <section className="fixed bottom-2 right-2 size-12 rounded-full flex justify-center items-center bg-primary ">
          <Bot size={32} className="text-primary-foreground" />
        </section>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>MACIEL I.A</SheetTitle>
          <SheetDescription>
            é uma inteligência artificial especializada em beleza capilar.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <section className="h-max flex flex-col">
          <section className="flex-1 h-full space-y-4">
            <section>
              <h1 className="text-card-foreground">{userPromptValue}</h1>
            </section>

            {/* Área de resposta com barra de rolagem */}
            <section
              className="bg-primary p-4 rounded-lg max-w-[80%] text-primary-foreground overflow-y-auto"
              style={{ maxHeight: "300px" }} // Define a altura máxima para a área de resposta com rolagem
            >
              <h2 dangerouslySetInnerHTML={{ __html: geminiResponse }} />
            </section>
          </section>
          <section className="flex flex-row flex-nowrap gap-4 fixed bottom-4 items-center">
            <Textarea
              onChange={(e) => setUserPromptValue(e.target.value)}
              value={userPromptValue} // Valor do campo de texto
              placeholder="Digite sua dúvida..."
              className="text-wrap col-span-1"
            />
            <Button
              variant={"outline"}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button
              onClick={() => {
                run(userPromptValue);
              }}
              className="mr-2"
            >
              <Send />
            </Button>
          </section>

          {/* Pré-visualização da imagem carregada */}
          {uploadedImage && (
            <section className="mt-4">
              <p>Imagem carregada:</p>
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Pré-visualização da imagem"
                className="max-w-xs max-h-64 object-contain border rounded"
              />
            </section>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}