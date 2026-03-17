'use client';

import * as React from 'react';
import {
  Search,
  Loader2,
  Package,
  RefreshCw,
  AlertTriangle,
  Filter,
  Clock,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StockTable } from '@/components/stocks/stock-table';
import { StockOutDialog } from '@/components/stocks/stock-out-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface StockItem {
  id: number;
  product_id: string;
  quantity: number;
  expiration_date: string | null;
  created_at: string;
  products: {
    name: string;
    gtin: number;
    thumbnail: string | null;
    brands?: {
      name: string;
    };
  };
}

export default function StocksPage() {
  const [data, setData] = React.useState<StockItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Edit State
  const [editingItem, setEditingItem] = React.useState<StockItem | null>(null);
  const [editQuantity, setEditQuantity] = React.useState('');
  const [editExpiration, setEditExpiration] = React.useState('');
  const [editLoading, setEditLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stocks');
      if (!response.ok) throw new Error('Erro ao buscar estoque');
      const result = await response.json();
      setData(result);
    } catch {
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.products.name.toLowerCase().includes(search.toLowerCase()) ||
      item.products.gtin.toString().includes(search) ||
      (item.products.brands?.name || '')
        .toLowerCase()
        .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;

    const expirationDate = item.expiration_date;

    // If it's a 'no_date' filter, only return items without a date
    if (statusFilter === 'no_date') {
      return !expirationDate;
    }

    // For other status filters, if there's no date, it's not a match
    if (!expirationDate) return false;

    const days = differenceInDays(parseISO(expirationDate), new Date());

    if (statusFilter === 'expired') return days < 0;
    if (statusFilter === 'expiring_soon') return days >= 0 && days <= 30;
    if (statusFilter === 'valid') return days > 30;

    return false;
  });

  // Summary Stats
  const stats = React.useMemo(() => {
    const totalLots = data.length;
    const totalUnits = data.reduce((acc, item) => acc + item.quantity, 0);
    const expired = data.filter(
      (item) =>
        item.expiration_date &&
        differenceInDays(parseISO(item.expiration_date), new Date()) < 0
    ).length;
    const expiringSoon = data.filter((item) => {
      if (!item.expiration_date) return false;
      const days = differenceInDays(parseISO(item.expiration_date), new Date());
      return days >= 0 && days <= 30;
    }).length;

    return { totalLots, totalUnits, expired, expiringSoon };
  }, [data]);

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
    setEditExpiration(item.expiration_date || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditLoading(true);
    try {
      const response = await fetch(`/api/stocks/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(editQuantity),
          expiration_date: editExpiration || null,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success('Estoque atualizado com sucesso');
      setEditingItem(null);
      fetchData();
    } catch {
      toast.error('Erro ao salvar alterações');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground italic">
            Gerencie lotes, vencimentos e saídas de produtos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <StockOutDialog onSuccess={fetchData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Lotes em Estoque
            </CardTitle>
            <Package className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLots}</div>
            <p className="text-muted-foreground text-[10px]">
              Total de entradas ativas
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            stats.expiringSoon > 0 ? 'border-rose-200 bg-rose-50/10' : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Perto de Vencer
            </CardTitle>
            <Clock
              className={`size-4 ${stats.expiringSoon > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {stats.expiringSoon}
            </div>
            <p className="text-muted-foreground text-[10px]">
              Vencimento em até 30 dias
            </p>
          </CardContent>
        </Card>
        <Card
          className={stats.expired > 0 ? 'border-red-200 bg-red-50/10' : ''}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Lotes Vencidos
            </CardTitle>
            <AlertTriangle
              className={`size-4 ${stats.expired > 0 ? 'text-red-500' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
            <p className="text-muted-foreground text-[10px]">
              Itens fora da validade
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 sm:max-w-xl">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                placeholder="Buscar por nome, marca ou GTIN..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="text-muted-foreground mr-2 size-4" />
                <SelectValue placeholder="Status de Validade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Itens</SelectItem>
                <SelectItem value="valid">No Prazo</SelectItem>
                <SelectItem value="expiring_soon">Próximo (30d)</SelectItem>
                <SelectItem value="expired">Vencido</SelectItem>
                <SelectItem value="no_date">Sem Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-rose-500" />
              <span>Resultados: {filteredData.length}</span>
            </div>
          </div>
        </div>

        {loading && data.length === 0 ? (
          <div className="bg-muted/20 flex h-64 items-center justify-center rounded-lg border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : (
          <StockTable
            data={filteredData}
            onRefresh={fetchData}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(val) => !val && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Lote de Estoque</DialogTitle>
            <DialogDescription>
              Ajuste a quantidade ou data de validade deste lote.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
              <div className="bg-muted/50 mb-4 rounded-lg border p-3 text-sm">
                <p className="font-semibold">{editingItem.products.name}</p>
                <p className="text-muted-foreground">
                  GTIN: {editingItem.products.gtin}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantidade</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiration">Data de Validade</Label>
                <Input
                  id="edit-expiration"
                  type="date"
                  value={editExpiration}
                  onChange={(e) => setEditExpiration(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingItem(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
