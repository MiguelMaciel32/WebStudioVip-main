"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';  
import { ModeToggle } from './ui/mode-toggle'; 
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut, Calendar } from "lucide-react"
import Compras from '@/components/compras';
import Agenda from "../components/listchat"; 
import {  MoreVertical, Mic, Send, MessageCircle } from 'lucide-react'

const templateClient = '/foto.jpg';  
const templateBusiness = '/foto.jpg';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoggedInEmpresa, setIsLoggedInEmpresa] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>('');  
  const [logoEmpresa, setLogoEmpresa] = useState<string>('');       

  const router = useRouter();

  const carregarDadosEmpresa = async () => {
    try {
      const token = sessionStorage.getItem('token_empresa');
      if (!token) return;

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
      setLogoEmpresa(data.logo || '');  
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  useEffect(() => {
    carregarDadosEmpresa();

    const token = sessionStorage.getItem('token');
    const token_empresa = sessionStorage.getItem('token_empresa');
    const savedProfilePicture = sessionStorage.getItem('profilePicture');  
    const savedProfileBusiness = sessionStorage.getItem('profileBusiness'); 

    if (token && !token_empresa) {
      setIsLoggedIn(true);
      setIsLoggedInEmpresa(false); 
      setProfilePicture(savedProfilePicture || templateClient); 
    }

    if (token_empresa && !token) {
      setIsLoggedInEmpresa(true);
      setIsLoggedIn(false); 
      setProfilePicture(savedProfileBusiness || logoEmpresa || templateBusiness); 
    }

    if (token && token_empresa) {
      setIsLoggedInEmpresa(true);
      setIsLoggedIn(false);
      setProfilePicture(savedProfileBusiness || logoEmpresa || templateBusiness);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('profilePicture');
    setIsLoggedIn(false);
    setProfilePicture(templateClient); 
    window.location.reload();
  };

  const handleLogoutEmpresa = () => {
    sessionStorage.removeItem('token_empresa');
    sessionStorage.removeItem('profileBusiness');
    setIsLoggedInEmpresa(false);
    setProfilePicture(templateBusiness);  
    window.location.reload();
  };

  const imageUrl = isLoggedInEmpresa ? logoEmpresa || templateBusiness : profilePicture || templateClient;

  return (
    <header className="border-b px-4 py-2 bg-background/80 backdrop-blur flex items-center sticky top-0 z-50">
      <Link href="/" className="flex-1">
        <h1 className="text-lg font-bold select-none cursor-pointer">
          StudioVip
        </h1>
      </Link>
      <nav className="flex gap-4 items-center">
        <ModeToggle />

        {(isLoggedIn || isLoggedInEmpresa) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
                <Image
                  src={imageUrl}
                  alt="Foto de perfil"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href={isLoggedInEmpresa ? "/profile-business" : "/profile"} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              {isLoggedInEmpresa && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/config-profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                  <Link href="/chat2" className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {isLoggedIn && (
               <>
               <DropdownMenuItem>
               <Link href="/agenda" className="flex items-center">
                   <Calendar className="mr-2 h-4 w-4" />
                   <span>Agenda</span>
                 </Link>
               </DropdownMenuItem>
               <DropdownMenuItem asChild>
                 <Link href="/chat2/chatcliente" className="flex items-center">
                   <MessageCircle className="mr-2 h-4 w-4" />
                   <span>Chat</span>
                 </Link>
               </DropdownMenuItem>
             </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={isLoggedInEmpresa ? handleLogoutEmpresa : handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        )}
      </nav>
    </header>
  );
}
