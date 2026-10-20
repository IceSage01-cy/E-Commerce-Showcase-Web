<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Lets the admin pick a font and a card style for each main category (color is the existing `accent`). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('font', 40)->default('Outfit')->after('accent');
            $table->string('style', 20)->default('classic')->after('font');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['font', 'style']);
        });
    }
};
