'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Para redirecionamento
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Clock, DollarSign, Trash2, User, PencilIcon } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast'; // Import toast for notifications

interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao: string;
}

export default function ConfigurarEmpresa() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [novoServico, setNovoServico] = useState<Servico>({ id: 0, nome: '', preco: 0, duracao: '' });
  const [descricao, setDescricao] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [logoEmpresa, setLogoEmpresa] = useState<string | null>(null); // Logo da empresa
  const [fotoPessoal, setFotoPessoal] = useState<string | null>(null);
  const templateBusiness = '/foto.jpg'; // Caminho padrão para caso não tenha logo

  const router = useRouter(); // Para redirecionamento

  // Função para carregar dados da empresa, incluindo os serviços
  const carregarDadosEmpresa = async () => {
    try {
      const token = sessionStorage.getItem('token_empresa'); // Certifique-se de que o token está armazenado

      if (!token) {
        // Se o token não existir, redireciona para a página de login
        toast({ title: 'Você precisa estar logado para acessar esta página.' });
        router.push('/login'); // Redirecionar para a página de login
        return;
      }

      // Carregando os dados gerais da empresa
      const response = await fetch('/api/empresa/dados', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Enviando o token JWT no cabeçalho
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados da empresa');
      }

      const data = await response.json();
      setDescricao(data.sobre || ''); // Definir sobre a empresa
      setLogoEmpresa(data.logo || templateBusiness); // Definir logo da empresa

      // Carregando os serviços da empresa
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
      setServicos(servicosData); // Definir os serviços recebidos da API
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao carregar dados da empresa e serviços.' });
    }
  };

  useEffect(() => {
    carregarDadosEmpresa(); // Carregar os dados da empresa ao montar o componente
  }, []);

  // Função para adicionar um novo serviço
  const adicionarServico = async () => {
    if (novoServico.nome && novoServico.preco && novoServico.duracao) {
      try {
        const token = sessionStorage.getItem('token_empresa'); // Certifique-se de que o token está armazenado
        const response = await fetch('/api/servico/cadastrar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nome: novoServico.nome,
            preco: novoServico.preco,  // Ajustado para 'preco'
            duracao: novoServico.duracao  // Ajustado para 'duracao'
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar serviço');
        }

        const result = await response.json();
        setServicos(prev => [...prev, result]); // Adicionar o novo serviço retornado
        setNovoServico({ id: 0, nome: '', preco: 0, duracao: '' });
      } catch (error) {
        console.error(error);
        toast({ title: 'Erro ao cadastrar serviço.' });
      }
    }
  };

  // Função para remover um serviço
  const removerServico = async (index: number) => {
    const servicoId = servicos[index].id;

    try {
      const token = sessionStorage.getItem('token_empresa'); // Certifique-se de que o token está armazenado
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
      const token = sessionStorage.getItem('token_empresa'); // Certifique-se de que o token está armazenado
      const response = await fetch('/api/empresa/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: newAbout,
          logo: logoEmpresa // Atualizando o logo no banco
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center mb-8">
        <Label htmlFor="fotoPessoal" className="cursor-pointer">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src={fotoPessoal || logoEmpresa || templateBusiness} alt="Foto Pessoal" />
            <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
          </Avatar>
          <Input id="fotoPessoal" type="file" className="hidden" onChange={(e) => handleImagemChange(e, setFotoPessoal)} accept="image/*" />
        </Label>
        <span className="text-sm text-muted-foreground">Clique para trocar a foto</span>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Configurar Empresa</h1>

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