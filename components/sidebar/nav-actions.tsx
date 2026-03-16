'use client';

import * as React from 'react';
import {
  Barcode,
  ClipboardList,
  Calendar,
  DollarSign,
  Package,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  name: string;
  gtin: number;
  thumbnail: string;
  brands?: {
    name: string;
  };
}

export function NavActions() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'gtin' | 'details'>('gtin');
  const [gtin, setGtin] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [product, setProduct] = React.useState<Product | null>(null);

  // Stock fields
  const [quantity, setQuantity] = React.useState('');
  const [unitPrice, setUnitPrice] = React.useState('');
  const [expirationDate, setExpirationDate] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setStep('gtin');
    setGtin('');
    setProduct(null);
    setQuantity('');
    setUnitPrice('');
    setExpirationDate('');
    setLoading(false);
  };

  const handleGtinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gtin) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${gtin}`);
      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }
      const data = await response.json();
      setProduct(data);
      setStep('details');
      // Pre-fill avg_price if available
      if (data.avg_price) {
        setUnitPrice(data.avg_price.toString());
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar produto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || !unitPrice) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: parseFloat(quantity),
          unit_price: parseFloat(unitPrice),
          expiration_date: expirationDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar estoque');
      }

      toast.success('Estoque registrado com sucesso!');
      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao registrar estoque';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Ações</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled tooltip="Carregando...">
              <Barcode className="size-4" />
              <span>Cadastrar Estoque</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Ações</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <SidebarMenuButton tooltip="Cadastrar Estoque">
                <Barcode className="size-4" />
                <span>Cadastrar Estoque</span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Entrada de Estoque</DialogTitle>
                <DialogDescription>
                  {step === 'gtin'
                    ? 'Informe o código de barras (GTIN/EAN) do produto.'
                    : 'Confirme os dados do produto e informe os valores de estoque.'}
                </DialogDescription>
              </DialogHeader>

              {step === 'gtin' ? (
                <form onSubmit={handleGtinSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="gtin">Código de Barras</Label>
                    <div className="relative">
                      <Barcode className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        id="gtin"
                        placeholder="Ex: 7891910000197"
                        className="pl-9"
                        value={gtin}
                        onChange={(e) => setGtin(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !gtin}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Package className="mr-2 size-4" />
                    )}
                    Verificar Produto
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleStockSubmit} className="space-y-4 py-4">
                  {product && (
                    <div className="bg-muted/50 flex items-start gap-4 overflow-hidden rounded-lg border p-3">
                      {product.thumbnail && (
                        <div className="bg-background relative size-16 shrink-0 overflow-hidden rounded border">
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 py-0.5">
                        <p
                          className="line-clamp-2 text-sm leading-tight font-semibold"
                          title={product.name}
                        >
                          {product.name}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {product.brands?.name || 'Sem marca'}
                        </p>
                        <p className="text-muted-foreground mt-0.5 font-mono text-[10px] uppercase">
                          GTIN: {product.gtin}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <div className="relative">
                        <ClipboardList className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-9"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço Unitário</Label>
                      <div className="relative">
                        <DollarSign className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-9"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry">Data de Validade</Label>
                    <div className="relative">
                      <Calendar className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        id="expiry"
                        type="date"
                        className="pl-9"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-4 sm:gap-0">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setStep('gtin')}
                      disabled={loading}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !quantity || !unitPrice}
                    >
                      {loading && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      Salvar no Estoque
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
