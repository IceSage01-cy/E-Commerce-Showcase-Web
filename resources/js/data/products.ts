// Shared product types + small formatting helpers.
// The actual catalog now lives in the database (see database/seeders/ProductSeeder.php)
// and is fetched from /api/products — nothing here is hardcoded data anymore.

export type Category = 'on-hand' | 'pre-order' | 'new-release';
export type Condition = 'New' | 'Pre-owned' | 'Loose' | 'Sealed';

export interface Product {
  id: string;
  name: string;
  series: string;
  character: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category: Category;
  condition: Condition;
  inStock: boolean;
  isFeatured: boolean;
  dateAdded: string;
  description: string;
  manufacturer: string;
  scale?: string | null;
  releaseDate?: string | null;
  estimatedArrival?: string | null;
}

/** Single source of truth for how availability is labelled/coloured everywhere (storefront + admin). */
export const stockStyle = {
  in: { text: '#22C55E', bg: 'rgba(34,197,94,0.1)', label: 'In Stock' },
  out: { text: '#606068', bg: 'rgba(96,96,104,0.12)', label: 'Out of Stock' },
} as const;

export function getStockStyle(inStock: boolean) {
  return inStock ? stockStyle.in : stockStyle.out;
}

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString('en-PH')}`;
}
