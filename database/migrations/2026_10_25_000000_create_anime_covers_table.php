<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One optional cover picture per anime series (keyed by the series name, as products store it).
 * Shown before the series' characters on the anime page and on the series tiles.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anime_covers', function (Blueprint $table) {
            $table->id();
            $table->string('series', 255)->unique();
            $table->string('image_url', 2048)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anime_covers');
    }
};
