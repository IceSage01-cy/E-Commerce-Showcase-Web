// Shared product types + small formatting helpers.
// The actual catalog now lives in the database (see database/seeders/ProductSeeder.php)
// and is fetched from /api/products — nothing here is hardcoded data anymore.

export type Category = 'on-hand' | 'pre-order' | 'new-release';
export type Condition = 'New' | 'Pre-owned' | 'Loose' | 'Sealed';
export type StockStatus = 'in-stock' | 'low-stock' | 'sold-out';

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
  stock: number;
  isFeatured: boolean;
  dateAdded: string;
  description: string;
  manufacturer: string;
  scale?: string | null;
  releaseDate?: string | null;
  estimatedArrival?: string | null;
}

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'sold-out';
  if (stock <= 3) return 'low-stock';
  return 'in-stock';
}

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString('en-PH')}`;
}
