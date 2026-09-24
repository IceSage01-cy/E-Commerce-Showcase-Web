<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'New Drops This Week',
                'subtitle' => 'Jujutsu Kaisen · Demon Slayer · One Piece',
                'cta_label' => 'Shop New Arrivals',
                'cta_action' => 'new-arrivals',
                'image_url' => 'https://images.unsplash.com/photo-1777730039398-830cddd1cf15?w=1600&h=700&fit=crop&auto=format',
                'accent' => '#FF2D78',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Japan Pre-Orders Now Open',
                'subtitle' => 'EVA Unit-01 · Gear 5 Luffy · Zero Two — Arriving Early 2027',
                'cta_label' => 'Reserve Yours',
                'cta_action' => 'pre-order',
                'image_url' => 'https://images.unsplash.com/photo-1762376622511-0c1d97912bf5?w=1600&h=700&fit=crop&auto=format',
                'accent' => '#F59E0B',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Rare Vintage Finds',
                'subtitle' => 'Classic Tokusatsu · Retro Anime · Limited Pre-owned Stock',
                'cta_label' => 'Browse Collection',
                'cta_action' => 'on-hand',
                'image_url' => 'https://images.unsplash.com/photo-1788928808718-c8bf344f4ee7?w=1600&h=700&fit=crop&auto=format',
                'accent' => '#A78BFA',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}
