'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Interface que define o formato dos dados da empresa
interface Empresa {
  id: number;
  nome_empresa: string;
  email: string;
  cnpj: string;
  telefone: string;
  sobre: string | null;
  address: string;
  logo: string | null;
}

// Componente da página sobre a empresa
function SobreEmpresa() {
  const router = useRouter(); // Hook para acessar o roteador e obter o ID da empresa
  const { id } = router.query; // Captura o 'id' da URL
  const [empresa, setEmpresa] = useState<Empresa | null>(null); // Estado para armazenar os dados da empresa

  useEffect(() => {
    if (id) {  // Verifica se o ID está disponível
      fetch(`/api/empresa?id=${id}`)  // Faz uma requisição à API para buscar os dados da empresa
        .then((response) => response.json())
        .then((data) => setEmpresa(data)) // Armazena os dados da empresa no estado
        .catch((error) => console.error('Erro ao buscar empresa:', error)); // Lida com erros
    }
  }, [id]); // O efeito depende do ID

  if (!empresa) { // Enquanto os dados estão carregando, exibe uma mensagem
    return <p>Carregando...</p>;
  }

  // Renderiza os dados da empresa
  return (
    <div>
      <h1>{empresa.nome_empresa}</h1>
      <p>Email: {empresa.email}</p>
      <p>CNPJ: {empresa.cnpj}</p>
      <p>Telefone: {empresa.telefone}</p>
      <p>Sobre: {empresa.sobre || 'Informação indisponível'}</p>
      <p>Endereço: {empresa.address}</p>
      <img src={empresa.logo || '/default-image.jpg'} alt={`${empresa.nome_empresa} logo`} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(SobreEmpresa), { ssr: false });
