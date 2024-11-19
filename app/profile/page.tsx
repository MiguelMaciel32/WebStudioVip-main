"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PencilIcon } from '@heroicons/react/24/solid';

const formatarTelefone = (valor: string) => {
    valor = valor.replace(/\D/g, "");
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{2})(\d)/, "($1) $2");
      valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return valor;
};

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<'about' | 'contact' | false>(false);
    const [newAbout, setNewAbout] = useState<string>('');
    const [newContact, setNewContact] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                toast({ title: 'Você precisa estar logado para acessar esta página.' });
                router.push('/login');
                return;
            }

            try {
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const data = await response.json();

                if (response.ok) {
                    setProfile(data);
                    setImagePreview(data.profile_picture);
                    setNewAbout(data.about || '');
                    setNewContact(data.contact || '');
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
    
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                toast({ title: "Apenas arquivos JPEG ou PNG são permitidos." });
                setSelectedFile(null);
                setImagePreview(null);
                return;
            }
    
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

        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', profile?.id);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setProfile((prevProfile: any) => ({
                    ...prevProfile,
                    profile_picture: data.profilePicture,
                }));
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

        const token = sessionStorage.getItem('token');
        const response = await fetch('/api/update-profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: profile?.id,
                about: newAbout,
                contact: newContact,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setProfile((prevProfile: any) => ({
                ...prevProfile,
                about: newAbout,
                contact: newContact,
            }));
            setIsEditing(false);
            toast({ title: 'Perfil atualizado com sucesso!' });
        } else {
            toast({ title: data.error || 'Erro ao atualizar perfil.' });
        }
    };

    const telefoneFormatado = profile?.contact ? formatarTelefone(profile.contact) : '';

    return (
        <div className="grid gap-6 max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
            <Dialog>
      <DialogTrigger asChild>
        <Avatar className="h-20 w-20 cursor-pointer border-primary">
          <AvatarImage src={imagePreview || profile?.profile_picture} alt="User Avataar" />
          <AvatarFallback />
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Imagem de Perfil</DialogTitle>
          <DialogDescription>
            Selecione uma nova imagem para o seu perfil.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="file"
            id="fileInput"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="rounded-lg" />
            </div>
          )}
        </div>
        <DialogFooter>
         <Button onClick={handleUpload}>Atualizar Imagem de Perfil</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
                <div className="grid gap-1">
                    <h2 className="text-2xl font-bold">{profile?.name}</h2>
                </div>
            </div>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Sobre
                            <Dialog>
                                <DialogTrigger>
                                    <PencilIcon className="w-5 h-5 ml-2 cursor-pointer" onClick={() => setIsEditing('about')} />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Editar Sobre</DialogTitle>
                                    </DialogHeader>
                                    {isEditing === 'about' && (
                                        <>
                                            <Textarea
                                                value={newAbout}
                                                onChange={(e) => setNewAbout(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            />
                                            <DialogFooter>
                                                <Button onClick={handleSave} className="mr-2">Salvar</Button>
                                                <Button onClick={() => setIsEditing(false)} variant="outline">Cancelar</Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{profile?.about || "comece editando sua biografia"}</p>
                    </CardContent>
                </Card>
                <Card className='rounded-lg border bg-card text-card-foreground shadow-sm'>
                    <CardTitle className='mx-2 mt-2'>
                        Contatos
                    </CardTitle>
                    <CardHeader>
                        <div className="flex flex-col items-start gap-4">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5" />
                                            <span>{profile?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MailOpenIcon className="w-5 h-5" />
                                            <span>{profile?.username}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="w-5 h-5" />
                                            <span>{telefoneFormatado}</span>
                                        </div>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger>
                                        <div className="w-5 h-5 ml-2 cursor-pointer" />
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Editar Perfil</DialogTitle>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}

function MailOpenIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
            <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
        </svg>
    );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
