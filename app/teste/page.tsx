import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star } from "lucide-react"

type Product = {
  id: number
  company_name: string
  address: string
  logo: string
  rating: number
  owner_avatar: string
}

const products: Product[] = [
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  {
    id: 1,
    company_name: "TechCorp",
    address: "Rua da Inovação, 123 - São Paulo, SP",
    logo: "/Empresa.jpg",
    rating: 4.5,
    owner_avatar: "/placeholder.svg?height=40&width=40"
  },
  // Adicione mais produtos conforme necessário
]

export default function Empresas() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Nossas Empresas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/sobreempresa/${product.id}`}>
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto">
              <CardHeader className="p-0 relative">
                <Image
                  src={product.logo || '/Empresa.jpg'}
                  alt={product.company_name || 'Imagem da empresa'}
                  width={300}
                  height={150}
                  className="w-full h-36 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-bold mb-1 truncate">{product.company_name || 'Nome da Empresa'}</CardTitle>
                <div className="flex items-center mb-2 text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <p className="text-xs truncate">{product.address || 'Endereço não disponível'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src={product.owner_avatar} alt="Avatar do proprietário" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-primary ml-1">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors">
                    Detalhes
                  </button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}