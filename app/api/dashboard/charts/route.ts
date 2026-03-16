import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';
import { parseISO, addDays } from 'date-fns';

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Stock by Brand (Top 5)
    const { data: brandData, error: brandError } = (await supabase
      .from('stocks')
      .select('quantity, products(brands(name))')) as {
      data:
        | {
            quantity: number;
            products: { brands: { name: string } | null } | null;
          }[]
        | null;
      error: PostgrestError | null;
    };

    if (brandError) throw brandError;

    const brandMap: Record<string, number> = {};
    brandData?.forEach((item) => {
      const brandName = item.products?.brands?.name || 'Sem Marca';
      brandMap[brandName] = (brandMap[brandName] || 0) + Number(item.quantity);
    });

    const stockByBrand = Object.entries(brandMap)
      .map(([name, qty]) => ({ brand: name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 2. Stock by Expiry Status
    const { data: expiryData, error: expiryError } = await supabase
      .from('stocks')
      .select('quantity, expiration_date');

    if (expiryError) throw expiryError;

    let expired = 0;
    let next30 = 0;
    let safe = 0;
    let noDate = 0;
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    expiryData?.forEach((stock) => {
      if (!stock.expiration_date) {
        noDate += Number(stock.quantity);
      } else {
        const expDate = parseISO(stock.expiration_date);
        if (expDate < now) {
          expired += Number(stock.quantity);
        } else if (expDate <= thirtyDaysFromNow) {
          next30 += Number(stock.quantity);
        } else {
          safe += Number(stock.quantity);
        }
      }
    });

    const stockByExpiry = [
      { status: 'Vencido', quantity: expired, fill: 'var(--color-expired)' },
      {
        status: 'Próximo (30d)',
        quantity: next30,
        fill: 'var(--color-next30)',
      },
      { status: 'No Prazo', quantity: safe, fill: 'var(--color-safe)' },
      { status: 'Sem Data', quantity: noDate, fill: 'var(--color-nodate)' },
    ].filter((item) => item.quantity > 0);

    return NextResponse.json({
      stockByBrand,
      stockByExpiry,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
