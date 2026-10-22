<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The per-category font picker was removed from the admin panel; the column is no longer used. */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('categories', 'font')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropColumn('font');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('categories', 'font')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('font', 40)->default('Outfit')->after('accent');
            });
        }
    }
};
