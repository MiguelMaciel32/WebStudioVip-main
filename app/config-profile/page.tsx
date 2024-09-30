'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Para redirecionamento
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, User, PencilIcon } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { ImagePlus, X } from "lucide-react";

interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao: string;
}

export default function ConfigurarEmpresa() {
  const [profile, setProfile] = useState<any>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [novoServico, setNovoServico] = useState<Servico>({ id: 0, nome: '', preco: 0, duracao: '' });
  const [descricao, setDescricao] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [logoEmpresa, setLogoEmpresa] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false); 

  const templateBusiness = '/foto.jpg'; 

  const router = useRouter(); 

  const carregarDadosEmpresa = async () => {
    try {
      const token = sessionStorage.getItem('token_empresa');

      if (!token) {
        toast({ title: 'Você precisa estar logado para acessar esta página.' });
        router.push('/login'); 
        return;
      }

      
      const response = await fetch('/api/empresa/dados', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados da empresa');
      }

      const data = await response.json();
      setDescricao(data.sobre || '');
      setLogoEmpresa(data.logo || templateBusiness); 

      const servicoResponse = await fetch('/api/servico/listar', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!servicoResponse.ok) {
        throw new Error('Erro ao carregar serviços da empresa');
      }

      const servicosData = await servicoResponse.json();
      setServicos(servicosData); 
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao carregar dados da empresa e serviços.' });
    }
  };

  useEffect(() => {
    carregarDadosEmpresa(); 
  }, []);

  const adicionarServico = async () => {
    if (novoServico.nome && novoServico.preco && novoServico.duracao) {
      try {
        const token = sessionStorage.getItem('token_empresa');
        const response = await fetch('/api/servico/cadastrar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nome: novoServico.nome,
            preco: novoServico.preco,
            duracao: novoServico.duracao
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar serviço');
        }

        const result = await response.json();
        setServicos(prev => [...prev, result]); 
        setNovoServico({ id: 0, nome: '', preco: 0, duracao: '' });
      } catch (error) {
        console.error(error);
        toast({ title: 'Erro ao cadastrar serviço.' });
      }
    }
  };

  const removerServico = async (index: number) => {
    const servicoId = servicos[index].id;

    try {
      const token = sessionStorage.getItem('token_empresa');
      const response = await fetch('/api/servico/remover', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ servicoId })
      });

      if (!response.ok) {
        throw new Error('Erro ao remover serviço');
      }

      setServicos(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao remover serviço.' });
    }
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('token_empresa'); 
  
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }
  
      const response = await fetch('/api/Update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: newAbout
        })
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar informações da empresa');
      }
  
      setDescricao(newAbout);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao atualizar informações da empresa.' });
    }
  };

  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoServico(prev => ({ ...prev, [name]: value }));
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>, setImagem: (value: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsConfirming(true); // Inicia a confirmação da imagem
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Nenhum arquivo selecionado.' });
      return;
    }

    const confirmUpload = window.confirm('Você tem certeza que deseja atualizar a imagem do perfil?');
    if (!confirmUpload) return;

    const token = sessionStorage.getItem('token_empresa');
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('/api/upload2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem.');
      }

      const data = await response.json();
      setProfile((prevProfile: any) => ({
        ...prevProfile,
        profile_picture: data.profilePicture,
      }));
      sessionStorage.setItem('profilePicture', data.profilePicture);
      toast({ title: 'Imagem atualizada com sucesso!' });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({ title: 'Erro ao fazer upload da imagem.' });
    }
  };

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleImageUpload(file);
    }
  };



  const handleDragOver2 = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave2 = () => {
    setIsDragging(false);
  };
  
  const handleDrop2 = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  
  const handleRemoveImage2 = () => {
    setImageUrl(null);
  };
  
  const handleFileInputChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImageUrl(e.target.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  
  const handleUpload2 = async () => {
    const fileInput = document.getElementById("photo-upload") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({ title: "Nenhum arquivo selecionado." });
      return;
    }

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const token = sessionStorage.getItem('token_empresa');
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const response = await fetch('/api/upload-ambiente', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Verifica se há uma mensagem de erro específica para exibir
        toast({ title: errorData.toast || errorData.error || 'Erro ao fazer upload.' });
        throw new Error(errorData.message || 'Erro ao fazer upload.');
      }

      toast({ title: "Upload realizado com sucesso!" });
      carregarDadosEmpresa();
      handleRemoveImage2();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center mb-8">
        <Label htmlFor="fotoPessoal" className="cursor-pointer">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src={imagePreview || logoEmpresa || templateBusiness} alt="Logo da Empresa" />
            <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
          </Avatar>
          <Input id="fotoPessoal" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </Label>
        {isConfirming ? (
          <div className="mt-2">
            <Button onClick={handleUpload} className="mr-2">Confirmar Imagem</Button>
            <Button onClick={() => setIsConfirming(false)} variant="outline">Cancelar</Button>
          </div>
        ) : (
          <Button onClick={handleUpload} className="mt-2">Atualizar Imagem</Button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Configurar Empresa</h1>

      





      <Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle className="text-center">Adicione ou altere a foto da sua empresa</CardTitle>
  </CardHeader>
  <CardContent>
    <div
      className={`relative h-64 border-2 border-dashed rounded-lg ${
        isDragging ? "border-primary" : "border-gray-300"
      } ${imageUrl ? "p-0" : "p-4"} transition-all duration-200 ease-in-out`}
      onDragOver={handleDragOver2}
      onDragLeave={handleDragLeave2}
      onDrop={handleDrop2}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Company location"
            className="w-full h-full object-cover rounded-lg"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage2}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remover imagem</span>
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ImagePlus className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 mb-2">Puxe e solte sua imagem aqui ou clique para carregar!</p>
          <Button variant="secondary" onClick={() => document.getElementById("photo-upload")?.click()}>
            Trocar Foto
          </Button>
        </div>
      )}
    </div>
    <input
      id="photo-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileInputChange2}
    />

    <div className="mt-4">
      <Button onClick={handleUpload2}>Confirmar Upload</Button>
    </div>
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <div className="flex-grow">
              <p>{descricao || 'Descreva sua empresa...'}</p>
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger>
                <PencilIcon className="w-5 h-5 ml-2 cursor-pointer" onClick={() => setNewAbout(descricao)} />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Sobre</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={newAbout}
                  onChange={(e) => setNewAbout(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <DialogFooter>
                  <Button onClick={handleSave} className="mr-2">Salvar</Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nomeServico">Nome do Serviço</Label>
              <Input
                id="nomeServico"
                name="nome"
                value={novoServico.nome}
                onChange={handleServicoChange}
                placeholder="Nome do serviço"
              />
            </div>
            <div>
              <Label htmlFor="precoServico">Preço (R$)</Label>
              <Input
                id="precoServico"
                name="preco"
                type="number"
                value={novoServico.preco}
                onChange={handleServicoChange}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="duracaoServico">Duração</Label>
              <Input
                id="duracaoServico"
                name="duracao"
                value={novoServico.duracao}
                onChange={handleServicoChange}
                placeholder="ex: 2 horas"
              />
            </div>
          </div>
          <Button onClick={adicionarServico} className="mt-4">Adicionar Serviço</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <p>Nenhum serviço cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {servicos.map((servico, index) => (
                <Card key={index} className="w-full max-w-sm">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{servico.nome}</h3>
                      <p className="text-sm text-muted-foreground">Valor: R$ {servico.preco}</p>
                      <p className="text-sm text-muted-foreground">{servico.duracao} min</p>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => removerServico(index)} aria-label="Deletar serviço">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
