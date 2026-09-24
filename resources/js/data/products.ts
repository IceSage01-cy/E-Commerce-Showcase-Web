export type Category = 'on-hand' | 'pre-order' | 'new-release';
export type Condition = 'New' | 'Pre-owned' | 'Loose' | 'Sealed';
export type StockStatus = 'in-stock' | 'low-stock' | 'sold-out';

export interface Product {
  id: string;
  name: string;
  series: string;
  character: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: Category;
  condition: Condition;
  stock: number;
  isFeatured: boolean;
  dateAdded: string;
  description: string;
  manufacturer: string;
  scale?: string;
  releaseDate?: string;
  estimatedArrival?: string;
}

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'sold-out';
  if (stock <= 3) return 'low-stock';
  return 'in-stock';
}

export const products: Product[] = [
  {
    id: 'p001',
    name: 'Hatsune Miku DX Premium Edition',
    series: 'Vocaloid',
    character: 'Hatsune Miku',
    price: 4200,
    images: [
      'https://images.unsplash.com/photo-1767700629009-c5b5dc7b5947?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1765633359000-4be57ed87b29?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'Sealed',
    stock: 2,
    isFeatured: true,
    dateAdded: '2026-09-15',
    description: 'The iconic Hatsune Miku 1/7 scale figure in her signature outfit, featuring incredible detail on the twin tails and outfit embroidery. Perfect centerpiece for any Vocaloid collection. Comes in original sealed packaging with original box art.',
    manufacturer: 'Good Smile Company',
    scale: '1/7',
  },
  {
    id: 'p002',
    name: 'Son Goku Super Saiyan God',
    series: 'Dragon Ball Super',
    character: 'Goku',
    price: 3800,
    salePrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1783765803308-fc2eba85cc2b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1770288784491-38537cc095b0?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 5,
    isFeatured: true,
    dateAdded: '2026-09-12',
    description: 'Dragon Ball Super Goku Super Saiyan God form with dynamic energy aura base. This figure captures the iconic "Super Saiyan God" transformation with vivid red hair and flowing red aura effects. Highly detailed sculpt with premium paint finish.',
    manufacturer: 'Bandai Tamashii Nations',
    scale: '1/8',
  },
  {
    id: 'p003',
    name: 'EVA Unit-01 Awakening Mode',
    series: 'Neon Genesis Evangelion',
    character: 'EVA-01',
    price: 6500,
    images: [
      'https://images.unsplash.com/photo-1762008387452-25fe91ab3f90?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1762376622511-0c1d97912bf5?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'pre-order',
    condition: 'Sealed',
    stock: 10,
    isFeatured: true,
    dateAdded: '2026-09-10',
    description: 'The legendary EVA Unit-01 in its terrifying Awakening Mode stance. This premium figure features LED light-up eyes, interchangeable parts, and a stunning energy wings effect. An absolute must-have for any Evangelion collector.',
    manufacturer: 'Kotobukiya',
    scale: '1/6',
    estimatedArrival: 'March 2027',
  },
  {
    id: 'p004',
    name: 'Rem Ice Flower Ver.',
    series: 'Re:Zero',
    character: 'Rem',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1770288784491-38537cc095b0?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1770288784592-a93a96be0bb2?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 3,
    isFeatured: false,
    dateAdded: '2026-09-18',
    description: 'Rem in her stunning Ice Flower variant, dressed in a beautiful ice-blue floral kimono with her signature horns adorned with frost crystals. A breathtaking 1/7 scale figure with exceptional paint detail and dynamic pose.',
    manufacturer: 'Pulchra',
    scale: '1/7',
  },
  {
    id: 'p005',
    name: 'Naruto Sage Mode Final Battle',
    series: 'Naruto Shippuden',
    character: 'Naruto Uzumaki',
    price: 2900,
    images: [
      'https://images.unsplash.com/photo-1770288784592-a93a96be0bb2?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1770288784491-38537cc095b0?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 8,
    isFeatured: false,
    dateAdded: '2026-09-17',
    description: 'Naruto in his iconic Sage Mode from the epic Ninja World War arc. Features natural energy aura effects around his feet, signature orange outfit with detailed mesh underlayer, and his characteristic sage eye markings painted with precision.',
    manufacturer: 'MegaHouse',
    scale: '1/8',
  },
  {
    id: 'p006',
    name: 'Monkey D. Luffy Gear 5',
    series: 'One Piece',
    character: 'Monkey D. Luffy',
    price: 5800,
    images: [
      'https://images.unsplash.com/photo-1770116119330-2c80bc762d0b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1770116119301-87ff10661443?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'pre-order',
    condition: 'Sealed',
    stock: 15,
    isFeatured: true,
    dateAdded: '2026-09-08',
    description: 'The newest and most powerful form of the King of Pirates — Gear 5 Luffy in his Sun God Nika awakening! White hair, white clothing, and surrounded by his cartoonish cloud-like aura. A monumental addition to any One Piece collection.',
    manufacturer: 'Good Smile Company',
    scale: '1/7',
    estimatedArrival: 'February 2027',
  },
  {
    id: 'p007',
    name: 'Jujutsu Kaisen Complete Set',
    series: 'Jujutsu Kaisen',
    character: 'Multiple',
    price: 7200,
    salePrice: 6500,
    images: [
      'https://images.unsplash.com/photo-1765633359000-4be57ed87b29?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1777730039398-830cddd1cf15?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 1,
    isFeatured: true,
    dateAdded: '2026-09-05',
    description: 'Complete set featuring Itadori Yuji, Megumi Fushiguro, and Nobara Kugisaki in their school uniforms with their respective weapons/shikigami. Sold as a set only. Last one in stock — collector\'s item.',
    manufacturer: 'Bandai Spirits',
    scale: '1/8',
  },
  {
    id: 'p008',
    name: 'Tanjiro Kamado Water Breathing',
    series: 'Demon Slayer',
    character: 'Tanjiro Kamado',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1770116119301-87ff10661443?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1770116119330-2c80bc762d0b?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 4,
    isFeatured: false,
    dateAdded: '2026-09-14',
    description: 'Tanjiro in his iconic Water Breathing Tenth Form pose, with flowing water blade effect. Beautifully captures the moment of his most powerful technique. Highly detailed checkered haori and battle-worn expression.',
    manufacturer: 'Aniplex',
    scale: '1/7',
  },
  {
    id: 'p009',
    name: 'Eren Yeager Attack Titan Mode',
    series: 'Attack on Titan',
    character: 'Eren Yeager',
    price: 4800,
    images: [
      'https://images.unsplash.com/photo-1768475022554-303bde099069?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1762376622511-0c1d97912bf5?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'pre-order',
    condition: 'Sealed',
    stock: 20,
    isFeatured: false,
    dateAdded: '2026-09-11',
    description: 'Eren in his Attack Titan transformation, featuring bone and muscle structure visible beneath semi-translucent resin skin panels. A complex, multi-material figure that showcases the brutal beauty of the Attack Titan form.',
    manufacturer: 'Gecco',
    scale: '1/6',
    estimatedArrival: 'April 2027',
  },
  {
    id: 'p010',
    name: 'Pochita Chainsaw Form',
    series: 'Chainsaw Man',
    character: 'Pochita',
    price: 1800,
    images: [
      'https://images.unsplash.com/photo-1762786613960-96fc8a8d8d6b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1765633359000-4be57ed87b29?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'New',
    stock: 12,
    isFeatured: false,
    dateAdded: '2026-09-16',
    description: 'Everyone\'s favorite chainsaw devil dog in his adorable Pochita form, complete with chainsaw handle tail and removable chainsaw protrusion. Small but incredibly detailed. Perfect desk or display companion.',
    manufacturer: 'Taito',
    scale: 'Non-scale',
  },
  {
    id: 'p011',
    name: 'Zero Two Pilot Suit Ver.',
    series: 'DARLING in the FranXX',
    character: 'Zero Two',
    price: 5200,
    salePrice: 4400,
    images: [
      'https://images.unsplash.com/photo-1770288784491-38537cc095b0?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1767700629009-c5b5dc7b5947?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'pre-order',
    condition: 'Sealed',
    stock: 8,
    isFeatured: false,
    dateAdded: '2026-09-09',
    description: 'Zero Two in her skin-tight red pilot suit with characteristic horns and flowing pink hair. This premium figure features a dynamic standing pose with wind effect on her hair and suit panels. A definitive Zero Two figure for serious collectors.',
    manufacturer: 'Max Factory',
    scale: '1/7',
    estimatedArrival: 'January 2027',
  },
  {
    id: 'p012',
    name: 'Vintage Tokusatsu Hero Set',
    series: 'Tokusatsu Collection',
    character: 'Multiple',
    price: 9500,
    images: [
      'https://images.unsplash.com/photo-1788928808718-c8bf344f4ee7?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1777730039398-830cddd1cf15?w=800&h=800&fit=crop&auto=format',
    ],
    category: 'on-hand',
    condition: 'Pre-owned',
    stock: 1,
    isFeatured: true,
    dateAdded: '2026-09-03',
    description: 'Rare vintage collection of classic Japanese tokusatsu hero figures from the 1970s-80s. Includes Ultraman, Kamen Rider, and Super Sentai figures in excellent pre-owned condition. Original paint, minor display wear consistent with age. A true collector\'s treasure.',
    manufacturer: 'Various (Bandai, Popy)',
    scale: 'Various',
  },
];

export const heroSlides = [
  {
    id: 's001',
    title: 'New Drops This Week',
    subtitle: 'Jujutsu Kaisen · Demon Slayer · One Piece',
    cta: 'Shop New Arrivals',
    ctaAction: 'new-arrivals',
    image: 'https://images.unsplash.com/photo-1777730039398-830cddd1cf15?w=1600&h=700&fit=crop&auto=format',
    accent: '#FF2D78',
  },
  {
    id: 's002',
    title: 'Japan Pre-Orders Now Open',
    subtitle: 'EVA Unit-01 · Gear 5 Luffy · Zero Two — Arriving Early 2027',
    cta: 'Reserve Yours',
    ctaAction: 'pre-order',
    image: 'https://images.unsplash.com/photo-1762376622511-0c1d97912bf5?w=1600&h=700&fit=crop&auto=format',
    accent: '#F59E0B',
  },
  {
    id: 's003',
    title: 'Rare Vintage Finds',
    subtitle: 'Classic Tokusatsu · Retro Anime · Limited Pre-owned Stock',
    cta: 'Browse Collection',
    ctaAction: 'on-hand',
    image: 'https://images.unsplash.com/photo-1788928808718-c8bf344f4ee7?w=1600&h=700&fit=crop&auto=format',
    accent: '#A78BFA',
  },
];

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString('en-PH')}`;
}
