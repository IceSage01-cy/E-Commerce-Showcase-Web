<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Caches the public product list so visitors don't each trigger a full read of the
 * products table (on Supabase every such read counts toward the monthly egress quota).
 *
 * Uses its own cache store (CATALOG_CACHE_STORE, default "file") rather than the app's
 * default one, because the default is the database; caching a database read in the
 * database would save nothing.
 *
 * Every change to a product bumps a version number, which makes all cached lists stale at once.
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
