'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star } from "lucide-react";
import { StarsIcon } from "lucide-react";

// Função para buscar produtos da API
async function fetchProducts() {
  try {
    const response = await fetch('https://apidelistagem-htb5ph6ay-luismiguels-projects.vercel.app');
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];  // Retorna uma lista vazia em caso de erro
  }
}

export default function PaginaDeProdutos() {
  const [products, setProducts] = useState<any[]>([]); // Estado para armazenar os produtos
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // useEffect para carregar os produtos ao montar o componente
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data); // Armazena os produtos no estado
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false); // Atualiza o estado de carregamento
      }
    }
    loadProducts();
  }, []);

  return (
    <section className="px-6 py-4">
      <h1 className="font-bold w-full text-center mt-4 text-3xl tracking-tighter md:text-5xl md:text-start">
        Studio por perto
      </h1>
      <p className="text-muted-foreground leading-relaxed text-center md:text-xl md:text-start mt-2">
        Que tal marcar com um dos profissionais disponíveis em nossa plataforma?
      </p>

      {loading ? (
        <p className="text-center mt-8">Carregando...</p> // Exibe uma mensagem de carregamento enquanto os produtos não são carregados
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
                      priority={product === products[0]} // Define prioridade para o primeiro item
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-bold mb-1 truncate">
                      {product.company_name || 'Nome da Empresa'}
                    </CardTitle>
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
                        <StarsIcon size={14} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-primary ml-1">
                          {product.rating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center">Nenhum produto encontrado.</p> // Mensagem caso não existam produtos
          )}
        </section>
      )}
    </section>
  );
}
