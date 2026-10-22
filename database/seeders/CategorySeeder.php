<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Only fills an empty table. The categories are managed from the admin panel now, so re-seeding must
        // never bring back a default category the admin deleted (or touch pictures/text they edited).
        if (Category::query()->exists()) {
            return;
        }

        foreach (config('catalog.collections') as $collection) {
            Category::create($collection);
        }
    }
}
