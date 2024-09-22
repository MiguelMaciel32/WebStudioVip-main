"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';  
import { ModeToggle } from './ui/mode-toggle'; 
import { useRouter } from 'next/navigation';
import { Settings, ShoppingCart } from 'lucide-react';

// Caminhos absolutos para imagens de fallback no diretório public
const templateClient = '/foto.jpg';  // Caminho da imagem padrão para clientes
const templateBusiness = '/foto.jpg'; // Caminho da imagem padrão para empresas

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoggedInEmpresa, setIsLoggedInEmpresa] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>('');  // Inicializa com string vazia
  const [logoEmpresa, setLogoEmpresa] = useState<string>('');        // Inicializa com string vazia

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
      setLogoEmpresa(data.logo || '');  // Define a logo da empresa se existir
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  useEffect(() => {
    carregarDadosEmpresa();

    const token = sessionStorage.getItem('token');
    const token_empresa = sessionStorage.getItem('token_empresa');
    const savedProfilePicture = sessionStorage.getItem('profilePicture');  // Foto do cliente
    const savedProfileBusiness = sessionStorage.getItem('profileBusiness'); // Logo da empresa

    // Verificação de quem está logado e ajuste das imagens
    if (token && !token_empresa) {
      setIsLoggedIn(true);
      setIsLoggedInEmpresa(false); 
      setProfilePicture(savedProfilePicture || templateClient);  // Usa a imagem salva ou fallback de cliente
    }

    if (token_empresa && !token) {
      setIsLoggedInEmpresa(true);
      setIsLoggedIn(false); 
      setProfilePicture(savedProfileBusiness || logoEmpresa || templateBusiness);  // Usa a imagem salva da empresa ou logo carregada
    }

    if (token && token_empresa) {
      // Caso o usuário tenha os dois tokens (empresa e cliente), priorizamos a empresa
      setIsLoggedInEmpresa(true);
      setIsLoggedIn(false);
      setProfilePicture(savedProfileBusiness || logoEmpresa || templateBusiness);  // Usa a imagem salva da empresa ou logo carregada
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('profilePicture');
    setIsLoggedIn(false);
    setProfilePicture(templateClient);  // Reseta para imagem de cliente
    window.location.reload();
  };

  const handleLogoutEmpresa = () => {
    sessionStorage.removeItem('token_empresa');
    sessionStorage.removeItem('profileBusiness');
    setIsLoggedInEmpresa(false);
    setProfilePicture(templateBusiness);  // Reseta para imagem de empresa
    window.location.reload();
  };

  // Definindo a URL da imagem de forma dinâmica com base em quem está logado
  const imageUrl = isLoggedInEmpresa ? logoEmpresa || templateBusiness : profilePicture || templateClient;

  return (
    <header className="border-b px-4 py-2 gap-2 bg-background/80 backdrop-blur flex items-center sticky top-0 inset-0">
      <Link href="/" className="flex-1">
        <h1 className="text-lg font-bold flex-1 select-none cursor-pointer flex">
          StudioVip
        </h1>
      </Link>
      <nav className="flex gap-5 items-center relative">
        {isLoggedIn && (
          <Link href="/compras">
            <Button variant="outline"><ShoppingCart /></Button>
          </Link>
        )}
        {isLoggedInEmpresa && (
          <Link href="/config-profile">
            <Button variant="outline"><Settings /></Button>
          </Link>
        )}

        <ModeToggle />

        <div className="flex items-center gap-2 relative">
          {(isLoggedIn || isLoggedInEmpresa) && (
            <div className="relative group">
              <div className="cursor-pointer">
                <Image
                  src={imageUrl} 
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ul className="flex flex-col p-2">
                  <li className="p-2 hover:bg-gray-100">
                    <Link className='text-escuro' href={isLoggedInEmpresa ? "/profile-business" : "/profile"}>
                      Perfil
                    </Link>
                  </li>
                  <li className="p-2 hover:bg-gray-100">
                    <button
                      onClick={isLoggedInEmpresa ? handleLogoutEmpresa : handleLogout}
                      className="w-full text-left text-escuro"
                    >
                      Sair da conta
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {!isLoggedIn && !isLoggedInEmpresa && (
            <Link href="/login" className='text-muted-foreground'>
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
