import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Component() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Perfil e Dados</h1>
          <p className="mt-2 text-muted-foreground">Gerencie suas informações pessoais e da empresa.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" type="text" defaultValue="João Silva" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="joao@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-photo">Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt="Foto de Perfil" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <Button variant="outline">Alterar Foto</Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input id="company-name" type="text" defaultValue="Acme Inc." readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Endereço</Label>
              <Textarea id="company-address" rows={3} defaultValue="Rua Exemplo, 123 - Cidade, Estado" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input id="company-phone" type="tel" defaultValue="(11) 1234-5678" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-cnpj">CNPJ</Label>
              <Input id="company-cnpj" type="text" defaultValue="12.345.678/0001-90" readOnly />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Produtos</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="font-bold text-lg">Produto A</div>
              <div className="text-primary font-bold text-2xl">R$ 99,99</div>
              <div className="text-muted-foreground">Descrição do produto A</div>
            </div>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="font-bold text-lg">Produto B</div>
              <div className="text-primary font-bold text-2xl">R$ 149,99</div>
              <div className="text-muted-foreground">Descrição do produto B</div>
            </div>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="font-bold text-lg">Produto C</div>
              <div className="text-primary font-bold text-2xl">R$ 79,99</div>
              <div className="text-muted-foreground">Descrição do produto C</div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="ml-auto">Salvar Alterações</Button>
        </div>
      </div>
    </div>
  )
}