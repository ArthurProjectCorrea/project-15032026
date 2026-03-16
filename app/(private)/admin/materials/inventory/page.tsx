"use client"

import { useState } from "react"
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  MoreHorizontal,
  Calendar,
  Tag
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { mockMaterials } from "@/lib/mock-materials"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("todos")
  
  const categories = Array.from(new Set(mockMaterials.map(m => m.category)))

  const filteredMaterials = mockMaterials.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todos" || m.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDaysToExpiry = (dateStr: string) => {
    const expiry = new Date(dateStr)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground/90">Estoque de Materiais</h2>
          <p className="text-muted-foreground">
            Controle físico, marcas e validade dos insumos.
          </p>
        </div>
        <Button className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Novo Material
        </Button>
      </div>

      <Card className="border-none bg-card/40 backdrop-blur-md shadow-xl shadow-black/5 ring-1 ring-white/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou marca..."
                className="pl-10 bg-background/40 border-muted-foreground/20 focus:ring-primary/30 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <Button 
                variant={selectedCategory === "todos" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCategory("todos")}
                className="rounded-full px-4 h-8 text-xs transition-all shrink-0"
              >
                Todos
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full px-4 h-8 text-xs transition-all shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-muted-foreground/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-muted-foreground/10">
                  <TableHead className="font-semibold text-foreground/70">Produto / Marca</TableHead>
                  <TableHead className="font-semibold text-foreground/70">Departamento</TableHead>
                  <TableHead className="font-semibold text-foreground/70 text-center">Data Validade</TableHead>
                  <TableHead className="font-semibold text-foreground/70 text-center">Quantidade</TableHead>
                  <TableHead className="font-semibold text-foreground/70">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground/70">Gerenciar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const daysToExpiry = getDaysToExpiry(material.expiryDate)
                  const isNearExpiry = daysToExpiry <= 30 && daysToExpiry > 0
                  
                  return (
                    <TableRow key={material.id} className="hover:bg-primary/5 transition-all border-muted-foreground/5 cursor-default group">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground/90">{material.name}</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest pt-0.5">
                            <Tag className="h-3 w-3" /> {material.brand}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal border-muted-foreground/20 text-muted-foreground text-[11px] px-2 py-0">
                          {material.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`flex items-center gap-1.5 text-xs font-mono font-medium ${isNearExpiry ? 'text-orange-500' : 'text-foreground/70'}`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(material.expiryDate).toLocaleDateString('pt-BR')}
                          </div>
                          {isNearExpiry && (
                            <span className="text-[9px] font-bold text-orange-500/80 bg-orange-500/10 px-1 rounded">VENCE EM {daysToExpiry} DIAS</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${material.status === 'baixo' ? 'text-orange-500' : 'text-foreground/80'}`}>
                            {material.stock} {material.unit}
                          </span>
                          {material.status === "baixo" && (
                            <span className="text-[9px] text-orange-500/80 font-medium italic">Mín. {material.minStock}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {material.status === "ok" ? (
                          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> EM DIA
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 w-fit px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-orange-500/20 animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> REPOR
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover/90 backdrop-blur-lg border-muted-foreground/10">
                            <DropdownMenuItem className="cursor-pointer">Lançar Entrada</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Lançar Saída</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted-foreground/10" />
                            <DropdownMenuItem className="cursor-pointer font-medium">Editar Detalhes</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
