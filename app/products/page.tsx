'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star } from "lucide-react";

interface Product {
  id: number;
  company_name: string;
  address: string;
  logo: string | null;
  ambient_photo: string | null;
  cep: string;
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('https://apidelistagem.vercel.app/?vercelToolbarCode=DQyB53C7ekGDRw6', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }

    const data = await response.json();
    console.log('Dados recebidos da API:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Função para calcular a diferença entre dois CEPs
function calculateCepDifference(cep1: string, cep2: string): number {
  const cep1Number = parseInt(cep1.replace(/\D/g, '')); // Remove caracteres não numéricos
  const cep2Number = parseInt(cep2.replace(/\D/g, '')); // Remove caracteres não numéricos
  return Math.abs(cep1Number - cep2Number); // Retorna a diferença absoluta entre os dois
}

export default function PaginaDeProdutos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCep, setUserCep] = useState<string | null>(null);

  // Recupera os dados do produto e do CEP do usuário
  useEffect(() => {
    async function loadProducts() {
      try {
        const storedCep = localStorage.getItem('userCep');
        if (storedCep) {
          setUserCep(storedCep);
        } else {
          console.error('CEP do usuário não encontrado');
        }

        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Ordenar os produtos com base na diferença do CEP
  useEffect(() => {
    if (userCep && products.length > 0) {
      const sortedProducts = [...products]
        .map((product) => ({
          ...product,
          distance: calculateCepDifference(userCep, product.cep),
        }))
        .sort((a, b) => a.distance - b.distance);

      setProducts(sortedProducts);
    }
  }, [userCep, products]);

  return (
    <section className="px-6 py-4">
      <h1 className="font-bold w-full text-center mt-4 text-3xl tracking-tighter md:text-5xl md:text-start">
        Studio por perto
      </h1>
      <p className="text-muted-foreground leading-relaxed text-center md:text-xl md:text-start mt-2">
        Que tal marcar com um dos profissionais disponíveis em nossa plataforma?
      </p>

      {loading ? (
        <p className="text-center mt-8">Carregando...</p>
      ) : (
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href={`/sobreempresa/${product.id}`}>
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={product.ambient_photo || '/Empresa.jpg'}
                      alt={product.company_name || 'Imagem da empresa'}
                      width={300}
                      height={150}
                      className="w-full h-36 object-cover"
                      priority={product === products[0]}
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-bold mb-1 truncate">{product.company_name || 'Nome da Empresa'}</CardTitle>
                    <div className="flex items-center mb-2 text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <p className="text-xs truncate">{product.address || 'Endereço não disponível'}</p>
                    </div>
                    <div className="flex items-center mb-3">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={product.logo || '/placeholder.svg?height=40&width=40'} alt="Avatar do proprietário" />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-primary ml-1">5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full">Nenhum produto encontrado.</p>
          )}
        </section>
      )}
    </section>
  );
}
