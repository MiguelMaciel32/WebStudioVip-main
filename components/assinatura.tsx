"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js"; 
import { toast } from "@/components/ui/use-toast";

type PlanOption = "mensal" | "trimestral" | "anual";

interface Plan {
  type: PlanOption;
  priceId: string; // ID do preço no Stripe
  description: string;
  savings?: string;
  features: string[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Assinatura() {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({ title: "Pedido realizado com sucesso!" });
    }
    if (query.get("canceled")) {
      toast({ title: "Pedido cancelado." });
    }
  }, []);

  const plans: Plan[] = [
    {
      type: "mensal",
      priceId: '29,90',
      description: "Perfeito para começar",
      features: ["Acesso a todos os recursos básicos", "Suporte por email", "Até 5 usuários"],
    },
    {
      type: "trimestral",
      priceId: '80,00',
      description: "Economize 11%",
      savings: "Economia de R$ 10 por mês",
      features: ["Todos os recursos do plano mensal", "Suporte prioritário", "Até 10 usuários"],
    },
    {
      type: "anual",
      priceId: '300',
      description: "Melhor valor! Economize 17%",
      savings: "Economia de R$ 60 por ano",
      features: ["Todos os recursos do plano trimestral", "Suporte 24/7", "Usuários ilimitados", "Treinamento personalizado"],
    },
  ];

  const handleSelectPlan = (planType: PlanOption) => {
    setSelectedPlan(planType);
  };

  const handleConfirmSelection = async () => {
    if (!selectedPlan) {
      toast({ title: "Por favor, selecione um plano." });
      return; 
    }

    console.log(`Plano selecionado: ${selectedPlan}`);

    try {
      const token = sessionStorage.getItem("token_empresa");
      if (!token) {
        toast({ title: "Você precisa estar logado para acessar esta página." });
        router.push("/login");
        return;
      }

      const selectedPlanDetails = plans.find((plan) => plan.type === selectedPlan);
      if (!selectedPlanDetails) {
        throw new Error("Detalhes do plano não encontrados.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plano: selectedPlanDetails.type,
          empresaId: token,
        }),
      });

      // Log de resposta da API
      console.log("Resposta da API:", response);

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Detalhes do erro da API:", errorDetails);
        throw new Error("Erro ao criar preferência de pagamento: " + (errorDetails.error || "Erro desconhecido"));
      }

      const data = await response.json();
      console.log("Dados retornados:", data); // Log dos dados retornados

      if (data.url) {
        // Redirecionar diretamente para a URL da sessão do Stripe
        window.location.href = data.url; 
      } else {
        throw new Error("URL da sessão não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao iniciar o pagamento:", error);
      toast({ title: "Erro ao iniciar o pagamento. Tente novamente mais tarde." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-2">Selecione seu plano de assinatura</h1>
        <p className="text-lg text-center mb-8">Escolha o plano que melhor atende às necessidades da sua empresa.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.type}
              className={`${selectedPlan === plan.type ? "border-primary ring-2 ring-primary" : ""} cursor-pointer transition-all`}
              onClick={() => handleSelectPlan(plan.type)}
              aria-selected={selectedPlan === plan.type} // Acessibilidade
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  R$ {plan.priceId} {/* Aqui, você pode mostrar o preço real, se disponível */}
                  <span className="text-sm font-normal">
                    /{plan.type === "mensal" ? "mês" : plan.type === "trimestral" ? "trimestre" : "ano"}
                  </span>
                </p>
                {plan.savings && <p className="text-sm text-green-600 mb-4">{plan.savings}</p>}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={selectedPlan === plan.type ? "default" : "outline"}>
                  {selectedPlan === plan.type ? "Selecionado" : "Selecionar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={handleConfirmSelection} disabled={!selectedPlan}>
            Confirmar Seleção
          </Button>
        </div>
      </div>
    </div>
  );
}
