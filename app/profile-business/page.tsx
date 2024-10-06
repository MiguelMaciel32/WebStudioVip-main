'use client';

import { useRouter } from 'next/navigation';
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import SalesChart from '@/components/SalesChart'; 
import  Assinatura from '../../components/assinatura';

interface Profile {
  id: string;
  logo?: string; 
  sobre?: string;
  telefone?: string;
  profile_picture?: string;
}

interface Agendamento {
  id: number;
  cliente: string;
  email: string;
  data_hora: string;
  servico: string;
}

export default function Page() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<'about' | 'contact' | false>(false);
  const [newAbout, setNewAbout] = useState<string>('');
  const [newContact, setNewContact] = useState<string>('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token_empresa = sessionStorage.getItem('token_empresa');
        if (!token_empresa) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/profile-empresa', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token_empresa}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setProfile(data);
          setImagePreview(data.logo || '');
          setNewAbout(data.sobre || '');
          setNewContact(data.telefone || '');
        } else {
          toast({ title: data.error || 'Erro ao carregar perfil.' });
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        toast({ title: 'Erro ao buscar perfil.' });
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token_empresa = sessionStorage.getItem('token_empresa');
        if (!token_empresa) {
          throw new Error('Token não encontrado');
        }

        const response = await fetch('/api/agendamentos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token_empresa}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setAgendamentos(data);
        } else {
          toast({ title: data.error || 'Erro ao buscar agendamentos.' });
        }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        toast({ title: 'Erro ao buscar agendamentos.' });
      }
    };

    fetchAgendamentos();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleImageClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Nenhum arquivo selecionado.' });
      return;
    }

    const confirmUpload = window.confirm('Você tem certeza que deseja atualizar a imagem do perfil?');
    if (!confirmUpload) return;

    const token_empresa = sessionStorage.getItem('token_empresa');
    if (!token_empresa) {
      toast({ title: 'Token não encontrado.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', profile?.id || '');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token_empresa}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('profilePicture', data.profilePicture);
        toast({ title: 'Imagem atualizada com sucesso!' });
        window.location.reload();
      } else {
        toast({ title: data.error || 'Erro ao atualizar imagem.' });
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({ title: 'Erro ao fazer upload da imagem.' });
    }
  };

  const handleSave = async () => {
    if (!newAbout.trim()) {
      toast({ title: 'Por favor, preencha todos os campos.' });
      return;
    }

    const token_empresa = sessionStorage.getItem('token_empresa');
    if (!token_empresa) {
      toast({ title: 'Token não encontrado.' });
      return;
    }

    const response = await fetch('/api/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token_empresa}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: profile?.id || '',
        about: newAbout,
        contact: newContact,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        about: newAbout,
        contact: newContact,
      }) as Profile);
      setIsEditing(false);
      toast({ title: 'Perfil atualizado com sucesso!' });
    } else {
      toast({ title: data.error || 'Erro ao atualizar perfil.' });
    }
  };

  const verificarPagamento = async () => {
    try {
      const token = sessionStorage.getItem('token_empresa');
      console.log(token);

      if (!token) {
        toast({ title: 'Você precisa estar logado para acessar esta página.' });
        router.push('/login');
        return;
      }

      const response = await fetch('/api/assinatura', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status de pagamento');
      }

      const data = await response.json();
      setIsPaid(data.isActive);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao verificar status de pagamento.' });
    }
  };
  useEffect(() => {
    verificarPagamento();
  }, []);


  if (isPaid === false) {
    return (
      <Assinatura></Assinatura>
    );
  }

  return(
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
       
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Vendas</CardTitle>
              <CardDescription>Olhe seu desempenho de vendas!</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart className="aspect-[4/3]" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Trabalhos Restantes</CardTitle>
              <CardDescription>Veja seus próximos compromissos agendados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendamentos.map((agendamento) => (
                    <TableRow key={agendamento.id}>
                      <TableCell>
                        <div className="font-medium">{agendamento.cliente}</div>
                        <div className="text-sm text-muted-foreground">{agendamento.email}</div>
                      </TableCell>
                      <TableCell>{new Date(agendamento.data_hora).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(agendamento.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}