// Shared product types + small formatting helpers.
// The actual catalog now lives in the database (see database/seeders/ProductSeeder.php)
// and is fetched from /api/products — nothing here is hardcoded data anymore.

/** Listing type: how the item is sold (in local stock, pre-order from Japan, ...). */
export type Category = 'on-hand' | 'pre-order' | 'new-release';

/** Things the admin can do to many products in one request. */
export type BulkAction = 'feature' | 'unfeature' | 'in_stock' | 'out_of_stock' | 'delete';

/** Main storefront category the item is filed under. */
export type Collection = 'anime-figures' | 'scale-figures' | 'rare-exclusive' | 'chix-figures';

/** Box condition: Mint In Sealed Box, Mint In Box, Box Included, or no box. */
export type Condition = 'MISB' | 'MIB' | 'BIB' | 'LOOSE';

export const CONDITIONS: Condition[] = ['MISB', 'MIB', 'BIB', 'LOOSE'];

export const COLLECTIONS: { slug: Collection; label: string }[] = [
  { slug: 'anime-figures', label: 'Anime Figures' },
  { slug: 'scale-figures', label: 'Scale Figures' },
  { slug: 'rare-exclusive', label: 'Rare / Exclusive Items' },
  { slug: 'chix-figures', label: 'CHIX Figures' },
];

export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug) as string[];

export function collectionLabel(slug: string): string {
  return COLLECTIONS.find((c) => c.slug === slug)?.label ?? slug;
}

<<<<<<< HEAD
export type CategoryStyle = 'classic' | 'bold' | 'glow';

export const CATEGORY_FONTS = ['Outfit', 'Inter', 'Poppins', 'Playfair Display', 'Bebas Neue', 'Bangers'];
export const CATEGORY_STYLES: { value: CategoryStyle; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'bold', label: 'Bold' },
  { value: 'glow', label: 'Glow' },
];

=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
/** A main category with its admin-managed background picture (from /api/categories). */
export interface CategoryInfo {
  id: string;
  slug: Collection;
  label: string;
  sublabel: string;
  description: string;
  accent: string;
<<<<<<< HEAD
  font: string;
  style: CategoryStyle;
=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
  image: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  series: string;
  character: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category: Category;
  collection: Collection;
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

/** Old condition names (before MISB/MIB/BIB/LOOSE) mapped to the new ones, for rows the migration could not rename. */
export function normalizeCondition(c: string): Condition {
  const map: Record<string, Condition> = { Sealed: 'MISB', New: 'MIB', 'Pre-owned': 'LOOSE', Loose: 'LOOSE' };
  return (CONDITIONS as string[]).includes(c) ? (c as Condition) : map[c] ?? 'MIB';
}
