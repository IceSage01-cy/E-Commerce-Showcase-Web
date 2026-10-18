<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Conditions are now MISB / MIB / BIB / LOOSE.
 *
 *   Sealed    -> MISB
 *   New       -> MIB
 *   Pre-owned -> LOOSE
 *   Loose     -> LOOSE
 *
 * The (name, series, condition) pair is unique, so a row is only renamed when that
 * would not collide with another listing; a colliding row keeps its old value and
 * can be fixed by hand in the admin panel.
 */
return new class extends Migration
{
    private const MAP = [
        'Sealed' => 'MISB',
        'New' => 'MIB',
        'Pre-owned' => 'LOOSE',
        'Loose' => 'LOOSE',
    ];

    public function up(): void
    {
        foreach (DB::table('products')->orderBy('id')->get(['id', 'name', 'series', 'condition']) as $row) {
            $new = self::MAP[$row->condition] ?? null;
            if ($new === null || $new === $row->condition) {
                continue;
            }

            $taken = DB::table('products')
                ->where('name', $row->name)
                ->where('series', $row->series)
                ->where('condition', $new)
                ->where('id', '!=', $row->id)
                ->exists();

            if (! $taken) {
                DB::table('products')->where('id', $row->id)->update(['condition' => $new]);
            }
        }
    }

    public function down(): void
    {
        $back = ['MISB' => 'Sealed', 'MIB' => 'New', 'BIB' => 'New', 'LOOSE' => 'Loose'];

        foreach (DB::table('products')->orderBy('id')->get(['id', 'name', 'series', 'condition']) as $row) {
            $old = $back[$row->condition] ?? null;
            if ($old === null) {
                continue;
            }

            $taken = DB::table('products')
                ->where('name', $row->name)->where('series', $row->series)
                ->where('condition', $old)->where('id', '!=', $row->id)->exists();

            if (! $taken) {
                DB::table('products')->where('id', $row->id)->update(['condition' => $old]);
            }
        }
    }
};
