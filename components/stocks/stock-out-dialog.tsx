'use client';

import * as React from 'react';
import {
  Barcode,
  ChevronRight,
  Loader2,
  MinusCircle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Batch {
  id: number;
  quantity: number;
  expiration_date: string | null;
  product_name: string;
}

interface StockOutDialogProps {
  onSuccess: () => void;
}

export function StockOutDialog({ onSuccess }: StockOutDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'gtin' | 'select' | 'amount'>('gtin');
  const [gtin, setGtin] = React.useState('');
  const [amount, setAmount] = React.useState('1');
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  const resetForm = () => {
    setStep('gtin');
    setGtin('');
    setAmount('1');
    setBatches([]);
    setSelectedBatchId(null);
    setLoading(false);
  };

  const handleGtinLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gtin) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stocks/reduce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gtin, amount: 1 }), // Just to check
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar produto');
      }

      if (data.action === 'select_batch') {
        setBatches(data.batches);
        if (data.batches.length === 1) {
          setSelectedBatchId(data.batches[0].id.toString());
          setStep('amount');
        } else {
          setStep('select');
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = () => {
    if (!selectedBatchId) return;
    setStep('amount');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !amount) return;

    const selectedBatch = batches.find(
      (b) => b.id.toString() === selectedBatchId
    );
    const reductionAmount = parseFloat(amount);

    if (selectedBatch && reductionAmount > selectedBatch.quantity) {
      toast.error(
        `Não é possível descontar mais do que o disponível (${selectedBatch.quantity})`
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stocks/reduce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gtin,
          amount: reductionAmount,
          stock_id: parseInt(selectedBatchId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar');
      }

      toast.success('Estoque atualizado com sucesso');
      setOpen(false);
      onSuccess();
      resetForm();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(
    (b) => b.id.toString() === selectedBatchId
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MinusCircle className="size-4" />
          Descontar do Estoque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Descontar do Estoque</DialogTitle>
          <DialogDescription>
            Reduza a quantidade de um produto informando o código de barras.
          </DialogDescription>
        </DialogHeader>

        {step === 'gtin' && (
          <form onSubmit={handleGtinLookup} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-out-gtin">Código de Barras (GTIN)</Label>
              <div className="relative">
                <Barcode className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="stock-out-gtin"
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
                <ChevronRight className="mr-2 size-4" />
              )}
              Verificar Lotes
            </Button>
          </form>
        )}

        {step === 'select' && (
          <div className="space-y-4 py-4">
            <Label>Selecione o Lote</Label>
            <ScrollArea className="h-48 rounded-md border p-2">
              <RadioGroup
                value={selectedBatchId || ''}
                onValueChange={setSelectedBatchId}
              >
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center space-x-2 border-b py-2 last:border-0"
                  >
                    <RadioGroupItem
                      value={batch.id.toString()}
                      id={`batch-${batch.id}`}
                    />
                    <Label
                      htmlFor={`batch-${batch.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Qtd: {batch.quantity}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {batch.expiration_date
                              ? `Vence: ${format(parseISO(batch.expiration_date), 'dd/MM/yy')}`
                              : 'Sem validade'}
                          </span>
                        </div>
                        {batch.expiration_date && (
                          <Calendar className="text-muted-foreground size-3" />
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
            <Button
              onClick={handleBatchSelect}
              className="w-full"
              disabled={!selectedBatchId}
            >
              Próximo
            </Button>
          </div>
        )}

        {step === 'amount' && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stock-out-amount">Quantidade a Descontar</Label>
                <span className="text-xs font-medium text-rose-600">
                  Disponível: {selectedBatch?.quantity}
                </span>
              </div>
              <Input
                id="stock-out-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedBatch?.quantity}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
              <p className="text-muted-foreground text-[10px]">
                Lote de:{' '}
                {selectedBatch?.expiration_date
                  ? format(parseISO(selectedBatch.expiration_date), 'dd/MM/yy')
                  : 'Sem data'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                className="flex-1"
                onClick={() => setStep('select')}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !amount}
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirmar Saída
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
