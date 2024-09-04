import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const EmpresaForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Verifique se o logo está definido
    if (!logo) {
      console.error('Logo is not defined.');
      setError('O logotipo é obrigatório.');
      return;
    }

    console.log('Form Values:', {
      companyName,
      contactInfo,
      address,
      username,
      password,
      logo
    });

    if (!companyName || !contactInfo || !address || !username || !password || !logo) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('contactInfo', contactInfo);
    formData.append('address', address);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('logo', logo);

    try {
      const response = await fetch('/api/cadastrar-empresa', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const result = await response.json();
        console.error('Error response body:', result);
        throw new Error(result.error || 'Erro ao cadastrar empresa');
      }

      const result = await response.json();
      console.log('Response body:', result);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Empresa cadastrada com sucesso!');
        // Limpar os campos após sucesso
        setCompanyName('');
        setContactInfo('');
        setAddress('');
        setUsername('');
        setPassword('');
        setLogo(null);
      }
    } catch (e) {
      console.error('Erro ao cadastrar empresa:', e);
      setError('Erro ao cadastrar empresa: ' + (e as Error).message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cadastrar Empresa</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <div className="grid gap-2">
            <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            <DialogDescription>Preencha o formulário para adicionar uma nova empresa.</DialogDescription>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <form className="grid w-full gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Digite o nome da empresa"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactInfo">Informações de Contato</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                placeholder="Digite as informações de contato"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Digite o endereço da empresa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo">Logotipo</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*" // Permite apenas imagens
                onChange={(e) => setLogo(e.target.files ? e.target.files[0] : null)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCompanyName('');
                  setContactInfo('');
                  setAddress('');
                  setUsername('');
                  setPassword('');
                  setLogo(null);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Cadastrar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaForm;