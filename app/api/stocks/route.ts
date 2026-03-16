import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { product_id, quantity, unit_price, expiration_date } = body;

  if (!product_id || quantity === undefined || unit_price === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('stocks')
      .insert({
        product_id,
        quantity,
        unit_price,
        expiration_date: expiration_date || null,
      })
      .select('*, products(*, brands(*))')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*, products(*, brands(*))')
      .order('expiration_date', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
