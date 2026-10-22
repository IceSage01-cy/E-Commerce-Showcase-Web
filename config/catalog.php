<?php

/*
|--------------------------------------------------------------------------
| Catalog vocabulary
|--------------------------------------------------------------------------
| Single source of truth for the storefront's main categories ("collections")
| and the allowed product conditions. Used by the migration that creates the
| categories table, the seeders, and request validation.
|
| The image / label / description of each main category can be changed later
| from Admin -> Categories; the values below are only the starting defaults.
*/

return [

    'conditions' => ['MISB', 'MIB', 'BIB', 'LOOSE'],

    'default_collection' => 'anime-figures',

    // Card looks an admin can pick for each category (Admin -> Categories); the color is the category's `accent`.
    'category_styles' => ['classic', 'bold', 'glow'],

    'collections' => [
        [
            'slug' => 'anime-figures',
            'label' => 'Anime Figures',
            'sublabel' => 'Characters from your favorite series',
            'description' => 'Prize figures, Nendoroids and collectibles from anime, manga and games.',
            'accent' => '#FF2D78',
            'image_url' => 'https://images.unsplash.com/photo-1783765803308-fc2eba85cc2b?w=900&h=600&fit=crop&auto=format',
            'sort_order' => 1,
        ],
        [
            'slug' => 'scale-figures',
            'label' => 'Scale Figures',
            'sublabel' => '1/7 · 1/6 · 1/8 and more',
            'description' => 'Detailed, display-grade statues in true collector scales.',
            'accent' => '#A78BFA',
            'image_url' => 'https://images.unsplash.com/photo-1767700629009-c5b5dc7b5947?w=900&h=600&fit=crop&auto=format',
            'sort_order' => 2,
        ],
        [
            'slug' => 'rare-exclusive',
            'label' => 'Rare / Exclusive Items',
            'sublabel' => 'Limited runs & hard-to-find pieces',
            'description' => 'Event exclusives, limited editions and vintage finds you will not see everywhere.',
            'accent' => '#F59E0B',
            'image_url' => 'https://images.unsplash.com/photo-1788928808718-c8bf344f4ee7?w=900&h=600&fit=crop&auto=format',
            'sort_order' => 3,
        ],
        [
            'slug' => 'chix-figures',
            'label' => 'CHIX Figures',
            'sublabel' => 'Our CHIX line',
            'description' => 'Browse the CHIX Figures collection.',
            'accent' => '#22C55E',
            'image_url' => null,
            'sort_order' => 4,
        ],
    ],
];
