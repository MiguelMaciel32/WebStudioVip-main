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
import { model } from "@/utils/GeminiUtils";
import { useState } from "react";

export default function ChatIA() {
  const [userPromptValue, setUserPromptValue] = useState<string>("");
  const [geminiResponse, setGeminiResponse] = useState<string>("");

  // Função para converter asteriscos em tags HTML <strong> para negrito
  const formatBoldText = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const run = async (userPrompt: string): Promise<void> => {
    const prompt = userPrompt;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Você deve responder apenas a perguntas relacionadas a cabelos, tatuagens, cuidados de spa e maquiagem. Se a pergunta não for sobre esses temas, responda com: Essa pergunta não está relacionada aos meus temas de especialidade. Você trabalha pra StudioVip, e o fundador é Luis Miguel Maciel dos Santos.Se perguntarem sobre a StudioVip, explique que é um site onde é possível agendar serviços de beleza como arrumar cabelo, barba, unhas, e sobrancelhas Se perguntarem quem criou a IA, responda que foi Luis Miguel.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    try {
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = await response.text();
      const formattedText = formatBoldText(text); // Formata o texto para negrito
      setGeminiResponse(formattedText);
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setGeminiResponse("Desculpe, houve um erro ao processar sua solicitação.");
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

            <section className="bg-primary p-4 rounded-lg max-w-[80%] text-primary-foreground">
              <h2 dangerouslySetInnerHTML={{ __html: geminiResponse }} />
            </section>
          </section>
          <section className="flex flex-row flex-nowrap gap-4 fixed bottom-4 items-center">
            <Textarea
              onChange={(e) => setUserPromptValue(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="text-wrap col-span-1"
            />
            <Button variant={"outline"}>
              <Image />
            </Button>
            <Button
              onClick={() => {
                run(userPromptValue);
              }}
              className="mr-2"
            >
              <Send />
            </Button>
          </section>
        </section>
      </SheetContent>
    </Sheet>
  );
}