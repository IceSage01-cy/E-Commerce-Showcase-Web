<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Dev-only account. The admin panel doesn't use this table; it logs in with ADMIN_PASSWORD.
        if (! app()->isProduction()) {
            User::firstOrCreate(
                ['email' => 'test@example.com'],
                ['name' => 'Test User', 'password' => 'password'],
            );
        }

        $this->call([
            CategorySeeder::class,
            BannerSeeder::class,
            ProductSeeder::class,
            ChixFigureSeeder::class,
        ]);
    }
}
