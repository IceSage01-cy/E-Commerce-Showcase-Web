<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add the new flag. Default true so nothing disappears from the shop.
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('in_stock')->default(true)->after('condition');
        });

        // 2. Carry existing data over: anything with 0 units becomes "out of stock".
        DB::table('products')->where('stock', '<=', 0)->update(['in_stock' => false]);

        // 3. Drop the old quantity column.
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock');
        });

        // 4. Indexes for the columns the storefront filters / sorts by.
        Schema::table('products', function (Blueprint $table) {
            $table->index(['category', 'date_added'], 'products_category_date_added_index');
            $table->index('is_featured', 'products_is_featured_index');
            $table->index('in_stock', 'products_in_stock_index');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->index(['is_active', 'sort_order'], 'banners_active_sort_index');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_active_sort_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_category_date_added_index');
            $table->dropIndex('products_is_featured_index');
            $table->dropIndex('products_in_stock_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('stock')->default(0)->after('condition');
        });

        // Best-effort restore: we no longer know the real quantity, so use 1 / 0.
        DB::table('products')->where('in_stock', true)->update(['stock' => 1]);

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('in_stock');
        });
    }
};
