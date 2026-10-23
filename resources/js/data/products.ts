// Shared product types + small formatting helpers.
// The actual catalog now lives in the database (see database/seeders/ProductSeeder.php)
// and is fetched from /api/products — nothing here is hardcoded data anymore.

/** Listing type: how the item is sold (in local stock, pre-order from Japan, ...). */
export type Category = 'on-hand' | 'pre-order' | 'new-release';

/** Things the admin can do to many products in one request. */
export type BulkAction = 'feature' | 'unfeature' | 'in_stock' | 'out_of_stock' | 'delete';

/** Main storefront category the item is filed under: the `slug` of a category managed in Admin -> Categories. */
export type Collection = string;

/** Box condition: Mint In Sealed Box, Mint In Box, Box Included, or no box. */
export type Condition = 'MISB' | 'MIB' | 'BIB' | 'LOOSE';

export const CONDITIONS: Condition[] = ['MISB', 'MIB', 'BIB', 'LOOSE'];

/** The CHIX Figures collection is split into prize figures and scale figures. */
export type FigureType = 'prize' | 'scale';

export const CHIX_SLUG = 'chix-figures';

/** Scale Figures never carry a Prize / Scale type. */
export const SCALE_SLUG = 'scale-figures';

export const FIGURE_TYPES: { value: FigureType; label: string; blurb: string }[] = [
  { value: 'prize', label: 'Prize Figures', blurb: 'Arcade and claw-machine prize figures: affordable, colourful, non-scale.' },
  { value: 'scale', label: 'Scale Figures', blurb: 'Detailed display pieces in true collector scales like 1/7, 1/6 and 1/8.' },
];

export type CategoryStyle = 'classic' | 'bold' | 'glow';

export const CATEGORY_STYLES: { value: CategoryStyle; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'bold', label: 'Bold' },
  { value: 'glow', label: 'Glow' },
];

/** A main category with its admin-managed background picture (from /api/categories). */
export interface CategoryInfo {
  id: string;
  slug: Collection;
  label: string;
  sublabel: string;
  description: string;
  accent: string;
  style: CategoryStyle;
  image: string | null;
  sortOrder: number;
}

/** Shown until /api/categories answers (or if it ever fails), so the menu and the homepage section are never blank. */
export const FALLBACK_CATEGORIES: CategoryInfo[] = [
  { id: 'f1', slug: 'anime-figures', label: 'Anime Figures', sublabel: 'Characters from your favorite series', description: '', accent: '#FF2D78', style: 'classic', image: null, sortOrder: 1 },
  { id: 'f2', slug: 'scale-figures', label: 'Scale Figures', sublabel: '1/7 · 1/6 · 1/8 and more', description: '', accent: '#A78BFA', style: 'classic', image: null, sortOrder: 2 },
  { id: 'f3', slug: 'rare-exclusive', label: 'Rare / Exclusive Items', sublabel: 'Limited runs & hard-to-find pieces', description: '', accent: '#F59E0B', style: 'classic', image: null, sortOrder: 3 },
  { id: 'f4', slug: 'chix-figures', label: 'CHIX Figures', sublabel: 'Our CHIX line', description: '', accent: '#22C55E', style: 'classic', image: null, sortOrder: 4 },
];

/** A category's name from its slug. Falls back to the slug itself (e.g. a product filed under a category that no longer exists). */
export function collectionLabel(slug: string, categories: CategoryInfo[]): string {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
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
  /** Only set for CHIX Figures: 'prize' or 'scale'. */
  figureType?: FigureType | null;
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
