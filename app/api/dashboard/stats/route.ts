import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseISO, addDays } from 'date-fns';

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Total Products
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // 2. Total Stock and Expiring Soon
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('quantity, expiration_date');

    if (stocksError) throw stocksError;

    let totalStock = 0;
    let expiringSoon = 0;
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    stocks?.forEach((stock) => {
      totalStock += Number(stock.quantity);
      if (stock.expiration_date) {
        const expDate = parseISO(stock.expiration_date);
        if (expDate <= thirtyDaysFromNow && expDate >= now) {
          expiringSoon++;
        }
      }
    });

    return NextResponse.json({
      totalProducts: productsCount || 0,
      totalStock,
      expiringSoon,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
