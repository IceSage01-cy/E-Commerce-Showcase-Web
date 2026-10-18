<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * - products.collection: the storefront's main category
 *   (Anime Figures / Scale Figures / Rare-Exclusive / CHIX Figures).
 * - categories table: label + background picture for each main category, editable from the admin panel.
 * - products.updated_at index: the admin list is sorted by "last changed first".
 *
 * Existing products land in the default collection; re-file them from Admin -> Products.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('collection')->default(config('catalog.default_collection', 'anime-figures'))->after('category');
            $table->index('collection', 'products_collection_index');
            $table->index('updated_at', 'products_updated_at_index');
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('label');
            $table->string('sublabel')->nullable();
            $table->text('description')->nullable();
            $table->string('accent', 7)->default('#FF2D78');
            $table->string('image_url', 2048)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $now = now();
        foreach (config('catalog.collections', []) as $c) {
            DB::table('categories')->insert($c + ['created_at' => $now, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_collection_index');
            $table->dropIndex('products_updated_at_index');
            $table->dropColumn('collection');
        });
    }
};
