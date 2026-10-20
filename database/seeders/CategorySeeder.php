<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent: identified by slug, never overwrites pictures/text edited in the admin panel.
        foreach (config('catalog.collections') as $collection) {
            Category::firstOrCreate(['slug' => $collection['slug']], $collection);
        }
    }
}
