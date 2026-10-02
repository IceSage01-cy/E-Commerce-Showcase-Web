<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Dev-only convenience account. (Previously this used User::factory()->raw(), whose random
        // email overrode the lookup key, so a brand-new user was created on every run.)
        // The admin panel does not use this table; it logs in with ADMIN_PASSWORD.
        if (! app()->isProduction()) {
            User::firstOrCreate(
                ['email' => 'test@example.com'],
                ['name' => 'Test User', 'password' => 'password'],
            );
        }

        $this->call([
            BannerSeeder::class,
            ProductSeeder::class,
        ]);
    }
}