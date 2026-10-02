<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Seeders used to insert blindly, so every run (or every deploy with RUN_SEEDERS=true)
 * piled up another copy of each product and banner. This removes the copies that already
 * exist (keeping the oldest row of each) and adds unique keys so the database itself can
 * never hold duplicates again, whatever code path inserts the rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->dedupe('products', ['name', 'series', 'condition']);
        $this->dedupe('banners', ['title']);

        Schema::table('products', function (Blueprint $table) {
            $table->unique(['name', 'series', 'condition'], 'products_name_series_condition_unique');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->unique('title', 'banners_title_unique');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropUnique('banners_title_unique');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_name_series_condition_unique');
        });
    }

    /** Delete every row after the first (lowest id) for each distinct key. Portable across sqlite/pgsql/mysql. */
    private function dedupe(string $table, array $columns): void
    {
        $seen = [];
        $duplicateIds = [];

        foreach (DB::table($table)->orderBy('id')->get(['id', ...$columns]) as $row) {
            $key = mb_strtolower(trim(implode('|', array_map(fn ($c) => (string) $row->{$c}, $columns))));

            if (isset($seen[$key])) {
                $duplicateIds[] = $row->id;
            } else {
                $seen[$key] = true;
            }
        }

        foreach (array_chunk($duplicateIds, 500) as $chunk) {
            DB::table($table)->whereIn('id', $chunk)->delete();
        }
    }
};
