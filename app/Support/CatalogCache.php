<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Caches the public product list so each visitor doesn't read the whole products table.
 * It uses its own store (CATALOG_CACHE_STORE, default "file") because the default is the database.
 * Any product change bumps a version number, which makes every cached list stale at once.
 */
class CatalogCache
{
    private static function store()
    {
        return Cache::store(env('CATALOG_CACHE_STORE', 'file'));
    }

    public static function version(): string
    {
        return (string) (self::store()->get('catalog:version') ?? '0');
    }

    /** Call whenever a product is created, changed or deleted. */
    public static function bump(): void
    {
        self::store()->forever('catalog:version', (string) microtime(true));
    }

    /** @param Closure():string $build returns the JSON body */
    public static function remember(string $key, Closure $build): string
    {
        $store = self::store();
        $fullKey = 'catalog:list:'.self::version().':'.$key;

        $hit = $store->get($fullKey);
        if (is_string($hit)) {
            return $hit;
        }

        $body = $build();
        $store->put($fullKey, $body, now()->addHours(6));

        return $body;
    }
}
