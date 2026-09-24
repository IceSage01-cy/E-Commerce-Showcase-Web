<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('series');
            $table->string('character')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            // List of image URLs / storage paths, in display order.
            $table->json('images')->nullable();
            $table->string('category')->default('on-hand'); // 'on-hand' | 'pre-order' | 'new-release'
            $table->string('condition')->default('New'); // 'New' | 'Pre-owned' | 'Loose' | 'Sealed'
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->date('date_added')->nullable();
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('scale')->nullable();
            $table->string('release_date')->nullable();
            $table->string('estimated_arrival')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
