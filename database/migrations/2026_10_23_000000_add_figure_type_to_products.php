<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * products.figure_type: only used by the CHIX Figures collection. Splits it into
 * "prize" (non-scale prize figures) and "scale" (scale figures), which is what
 * the "View all" selection screen on the storefront filters by. Null for every other collection.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('figure_type', 20)->nullable()->after('collection');
            $table->index(['collection', 'figure_type'], 'products_collection_figure_type_index');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_collection_figure_type_index');
            $table->dropColumn('figure_type');
        });
    }
};
