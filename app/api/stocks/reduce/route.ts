import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { gtin, amount, stock_id } = body;

  if (!gtin || !amount) {
    return NextResponse.json(
      { error: 'GTIN and amount are required' },
      { status: 400 }
    );
  }

  try {
    // If stock_id is provided, reduce directly from that batch
    if (stock_id) {
      const { data: currentStock, error: fetchError } = await supabase
        .from('stocks')
        .select('quantity')
        .eq('id', stock_id)
        .single();

      if (fetchError || !currentStock) {
        return NextResponse.json(
          { error: 'Entrada de estoque não encontrada' },
          { status: 404 }
        );
      }

      if (currentStock.quantity < amount) {
        return NextResponse.json(
          {
            error: `Saldo insuficiente. Disponível: ${currentStock.quantity}`,
          },
          { status: 400 }
        );
      }

      const newQuantity = currentStock.quantity - amount;

      if (newQuantity <= 0) {
        // Auto-delete if zeroed
        const { error: deleteError } = await supabase
          .from('stocks')
          .delete()
          .eq('id', stock_id);

        if (deleteError) throw deleteError;
      } else {
        const { error: updateError } = await supabase
          .from('stocks')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', stock_id);

        if (updateError) throw updateError;
      }

      return NextResponse.json({
        success: true,
        reduced: amount,
        remaining: newQuantity,
      });
    }

    // Lookup batches by GTIN (Do NOT reduce automatically here)
    const { data: batches, error: batchError } = await supabase
      .from('stocks')
      .select('*, products(*)')
      .eq('products.gtin', parseInt(gtin))
      .gt('quantity', 0)
      .order('expiration_date', { ascending: true });

    if (batchError) throw batchError;

    const filteredBatches = batches.filter((batch) => batch.products !== null);

    if (filteredBatches.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item em estoque para este GTIN' },
        { status: 404 }
      );
    }

    // Always return batches for the frontend to handle the next step
    return NextResponse.json({
      action: 'select_batch',
      batches: filteredBatches.map((b) => ({
        id: b.id,
        quantity: b.quantity,
        expiration_date: b.expiration_date,
        product_name: b.products.name,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
