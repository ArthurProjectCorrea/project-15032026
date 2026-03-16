import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getProductByGtin } from '@/lib/cosmos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gtin: string }> }
) {
  const { gtin } = await params;
  const supabase = await createClient();

  try {
    // 1. Check if product exists in local database
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*, brands(*)')
      .eq('gtin', parseInt(gtin))
      .single();

    if (existingProduct) {
      return NextResponse.json(existingProduct);
    }

    // 2. Not found locally, search Cosmos API
    const cosmosProduct = await getProductByGtin(gtin);

    if (!cosmosProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 3. Register brand if it doesn't exist
    let brandId = null;
    if (cosmosProduct.brand?.name) {
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', cosmosProduct.brand.name)
        .single();

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({
            name: cosmosProduct.brand.name,
            picture: cosmosProduct.brand.picture,
          })
          .select('id')
          .single();

        if (brandError) {
          console.error('Error creating brand:', brandError);
        } else {
          brandId = newBrand.id;
        }
      }
    }

    // 4. Register product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        gtin: cosmosProduct.gtin,
        name: cosmosProduct.description,
        brand_id: brandId,
        net_weight: cosmosProduct.net_weight,
        gross_weight: cosmosProduct.gross_weight,
        avg_price: cosmosProduct.avg_price,
        ncm_code: cosmosProduct.ncm?.code,
        thumbnail: cosmosProduct.thumbnail,
      })
      .select('*, brands(*)')
      .single();

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(newProduct);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
