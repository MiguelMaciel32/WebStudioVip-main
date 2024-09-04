"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';  
import { ModeToggle } from './ui/mode-toggle'; 
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import CadastrarEmpresaModal from '@/components/empresa';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const template = 'https://cdn.discordapp.com/attachments/1280686220711559180/1280687206742360215/logo_sv.png?ex=66d8fc68&is=66d7aae8&hm=663c516f4dc2c83dfcbf08e6ceee7bcf29f25e773e76a3b353c15c504495c824&';
  
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedProfilePicture = sessionStorage.getItem('profilePicture');

    setIsLoggedIn(!!token);
    setProfilePicture(savedProfilePicture || template);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('profilePicture');
    setIsLoggedIn(false);
    setProfilePicture(null);
    window.location.reload();
  };

  const handleButtonClick = () => {
    router.push('/cadastraempresa'); // Redireciona para a página de perfil
  };

  return (
    <header className="border-b px-4 py-2 gap-2 bg-background/80 backdrop-blur flex items-center sticky top-0 inset-0">
      <Link href="/" className="flex-1">
        <h1 className="text-lg font-bold flex-1 select-none cursor-pointer flex">
          StudioVip
        </h1>
      </Link>
      <nav className="flex gap-5 items-center relative">
        {/* Exibir o botão "Cadastrar Empresa" apenas se o usuário estiver logado */}
        {isLoggedIn}

        <ModeToggle />

        <div className="flex items-center gap-2 relative">
          {isLoggedIn ? (
            <div className="relative group">
              <div className="cursor-pointer">
                <Image
                  src={profilePicture || ''}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ul className="flex flex-col p-2">
                  <li className="p-2 hover:bg-gray-100">
                    <Link className='text-escuro' href="/profile">
                      Perfil
                    </Link>
                  </li>
                  <li className="p-2 hover:bg-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-escuro"
                    >
                      Sair da conta
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link href="/login" className='text-muted-foreground'>
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}