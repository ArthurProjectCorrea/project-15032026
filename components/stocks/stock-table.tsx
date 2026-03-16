'use client';

import * as React from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MoreHorizontal,
  Trash2,
  Edit,
  AlertTriangle,
  Calendar,
  Copy,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StockEntry {
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

interface StockTableProps {
  data: StockEntry[];
  onRefresh: () => void;
  onEdit: (entry: StockEntry) => void;
}

export function StockTable({ data, onRefresh, onEdit }: StockTableProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada de estoque?'))
      return;

    try {
      const response = await fetch(`/api/stocks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir');
      toast.success('Entrada excluída com sucesso');
      onRefresh();
    } catch {
      toast.error('Erro ao excluir entrada de estoque');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado para a área de transferência');
  };

  const getStatusBadge = (expirationDate: string | null) => {
    if (!expirationDate) return null;

    const days = differenceInDays(parseISO(expirationDate), new Date());

    if (days < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    if (days <= 30) {
      return (
        <Badge
          variant="outline"
          className="border-rose-600 bg-rose-50 text-rose-600"
        >
          <AlertTriangle className="mr-1 size-3" />
          Vence em {days} dias
        </Badge>
      );
    }
    return <Badge variant="secondary">No prazo</Badge>;
  };

  return (
    <div className="bg-background rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Produto</TableHead>
            <TableHead>GTIN</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum item em estoque encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className={
                  item.expiration_date &&
                  differenceInDays(
                    parseISO(item.expiration_date),
                    new Date()
                  ) <= 30
                    ? 'bg-rose-50/30'
                    : ''
                }
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.products.thumbnail ? (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded border bg-white">
                        <Image
                          src={item.products.thumbnail}
                          alt={item.products.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded border">
                        <Calendar className="text-muted-foreground size-5" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col">
                      <span
                        className="truncate text-sm font-medium"
                        title={item.products.name}
                      >
                        {item.products.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {item.products.brands?.name || 'Sem marca'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs uppercase">
                  <div className="group flex items-center gap-2">
                    <span>{item.products.gtin}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        copyToClipboard(item.products.gtin.toString())
                      }
                      title="Copiar GTIN"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {item.quantity.toLocaleString('pt-BR')} un
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.expiration_date
                    ? format(parseISO(item.expiration_date), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })
                    : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(item.expiration_date)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
