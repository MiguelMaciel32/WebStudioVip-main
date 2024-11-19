import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white w-screen">
      <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4">Sobre Nós</h2>
            <p className="text-gray-300">
              Conectamos você aos melhores profissionais e estúdios perto de você. 
              Descubra talentos locais e agende seus serviços com facilidade.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/business" className="text-gray-300 hover:text-white transition-colors">
                  Trabalhe conosco
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-300 hover:text-white transition-colors">
                Seja nosso cliente
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">&copy; 2024 StudioVips. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={24} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}