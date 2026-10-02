<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\Product;
use Illuminate\Console\Command;

class DedupeCatalog extends Command
{
    protected $signature = 'catalog:dedupe {--dry-run : Show what would be removed without deleting anything}';

    protected $description = 'Remove duplicate products and banners left behind by repeated seeding (keeps the oldest row of each).';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $products = $this->dedupe(Product::query()->orderBy('id')->get(['id', 'name', 'series', 'condition']),
            fn ($p) => mb_strtolower(trim($p->name.'|'.$p->series.'|'.$p->condition)), Product::class, $dry);

        $banners = $this->dedupe(Banner::query()->orderBy('id')->get(['id', 'title']),
            fn ($b) => mb_strtolower(trim($b->title)), Banner::class, $dry);

        $verb = $dry ? 'Would remove' : 'Removed';
        $this->info("{$verb} {$products} duplicate product(s) and {$banners} duplicate banner(s).");

        return self::SUCCESS;
    }

    /** @return int number of duplicate rows found/removed */
    private function dedupe($rows, callable $key, string $model, bool $dry): int
    {
        $seen = [];
        $duplicateIds = [];

        foreach ($rows as $row) {
            $k = $key($row);
            if (isset($seen[$k])) {
                $duplicateIds[] = $row->id;
            } else {
                $seen[$k] = true;
            }
        }

        if (! $dry && $duplicateIds) {
            $model::whereIn('id', $duplicateIds)->delete();
        }

        return count($duplicateIds);
    }
}
