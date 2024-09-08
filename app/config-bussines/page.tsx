'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast'; // Certifique-se de que este caminho está correto
import Image from 'next/image';

interface Company {
  id: string;
  logo?: string;
  address?: string;
  produto1?: string;
  produto2?: string;
  produto3?: string;
  ambienteImages?: string[];
}

export default function Configuracao() {
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedAmbienteImages, setSelectedAmbienteImages] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ambientePreviews, setAmbientePreviews] = useState<string[]>([]);
  const [newProduto1, setNewProduto1] = useState<string>('');
  const [newProduto2, setNewProduto2] = useState<string>('');
  const [newProduto3, setNewProduto3] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch('/api/company-info');
        const data: Company = await response.json();
        if (response.ok) {
          setCompany(data);
          setLogoPreview(data.logo || null);
          setAmbientePreviews(data.ambienteImages || []);
          setNewProduto1(data.produto1 || '');
          setNewProduto2(data.produto2 || '');
          setNewProduto3(data.produto3 || '');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao buscar informações da empresa:', error);
      }
    };

    fetchCompany();
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedAmbienteImages(fileArray);
      setAmbientePreviews(fileArray.map(file => URL.createObjectURL(file)));
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedLogo && selectedAmbienteImages.length === 0) {
      return;
    }

    const formData = new FormData();
    if (selectedLogo) {
      formData.append('file', selectedLogo);
    }
    selectedAmbienteImages.forEach((file, index) => {
      formData.append(`ambienteImages[${index}]`, file);
    });

    try {
      const response = await fetch('/api/upload2', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setCompany(prev => ({
          ...prev!,
          logo: data.logo || prev?.logo,
          ambienteImages: data.ambienteImages || prev?.ambienteImages,
        }));
        console.log('Imagens atualizadas com sucesso!');
      } else {
        console.log(data.error || 'Erro ao atualizar imagens.');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      console.log('Erro ao fazer upload.');
    }
  };

  const handleSave = async () => {
    if (!company?.id) {
      console.log('ID da empresa não disponível.');
      return;
    }

    try {
      const response = await fetch('/api/update-company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: company.id,
          produto1: newProduto1,
          produto2: newProduto2,
          produto3: newProduto3,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCompany(prev => ({
          ...prev!,
          produto1: newProduto1,
          produto2: newProduto2,
          produto3: newProduto3,
        }));
        console.log('Informações da empresa atualizadas com sucesso!');
      } else {
        console.log(data.error || 'Erro ao atualizar informações da empresa.');
      }
    } catch (error) {
      console.error('Erro ao atualizar informações da empresa:', error);
      console.log('Erro ao atualizar informações da empresa.');
    }
  };

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Configuração da Empresa</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Foto de Perfil</h2>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {logoPreview && <Image src={logoPreview} alt="Preview" width={200} height={200} className="my-2" />}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Fotos do Ambiente</h2>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        {ambientePreviews.map((preview, index) => (
          <Image key={index} src={preview} alt={`Ambiente Preview ${index + 1}`} width={200} height={200} className="my-2" />
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Produtos</h2>
        <input
          type="text"
          value={newProduto1}
          onChange={(e) => setNewProduto1(e.target.value)}
          placeholder="Produto 1"
          className="mb-2 p-2 border rounded"
        />
        <input
          type="text"
          value={newProduto2}
          onChange={(e) => setNewProduto2(e.target.value)}
          placeholder="Produto 2"
          className="mb-2 p-2 border rounded"
        />
        <input
          type="text"
          value={newProduto3}
          onChange={(e) => setNewProduto3(e.target.value)}
          placeholder="Produto 3"
          className="mb-2 p-2 border rounded"
        />
      </div>

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Atualizar Imagens
      </button>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white p-2 rounded mt-4"
      >
        Salvar Informações
      </button>
    </div>
  );
}