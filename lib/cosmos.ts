/**
 * Service to interact with the Bluesoft Cosmos API
 * https://api.cosmos.bluesoft.com.br
 */

const COSMOS_API_URL = process.env.COSMOS_API_URL || '';
const COSMOS_API_TOKEN = process.env.COSMOS_API_TOKEN;
const COSMOS_USER_AGENT = process.env.COSMOS_USER_AGENT || '';

if (!COSMOS_API_TOKEN) {
  console.warn('COSMOS_API_TOKEN is not defined in environmental variables.');
}

const headers = {
  'X-Cosmos-Token': COSMOS_API_TOKEN || '',
  'User-Agent': COSMOS_USER_AGENT,
  'Content-Type': 'application/json',
};

export interface CosmosProduct {
  gtin: number;
  description: string;
  thumbnail: string;
  price: string;
  avg_price: number;
  max_price: number;
  net_weight: number;
  gross_weight: number;
  brand?: {
    name: string;
    picture: string;
  };
  ncm?: {
    code: string;
    description: string;
    full_description: string;
  };
  gpc?: {
    code: string;
    description: string;
  };
}

export interface CosmosSearchResponse {
  total_count: number;
  current_page: number;
  per_page: number;
  products: CosmosProduct[];
}

/**
 * Get product details by GTIN (EAN)
 */
export async function getProductByGtin(
  gtin: string
): Promise<CosmosProduct | null> {
  try {
    const response = await fetch(`${COSMOS_API_URL}/gtins/${gtin}.json`, {
      method: 'GET',
      headers,
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(
        `Cosmos API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching GTIN ${gtin}:`, error);
    throw error;
  }
}

/**
 * Search products by description or GTIN
 */
export async function searchProducts(
  query: string,
  page = 1,
  perPage = 30
): Promise<CosmosSearchResponse> {
  try {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: Math.min(perPage, 90).toString(),
    });

    const response = await fetch(
      `${COSMOS_API_URL}/products?${params.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cosmos API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error searching products for "${query}":`, error);
    throw error;
  }
}

/**
 * Get products by NCM code
 */
export async function getProductsByNcm(
  ncmCode: string,
  page = 1
): Promise<CosmosSearchResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    const response = await fetch(
      `${COSMOS_API_URL}/ncms/${ncmCode}/products?${params.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cosmos API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for NCM ${ncmCode}:`, error);
    throw error;
  }
}
