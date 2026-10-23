<?php

namespace App\Models;

use App\Support\CatalogCache;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        // Any change makes the cached public product list stale.
        static::saved(fn () => CatalogCache::bump());
        static::deleted(fn () => CatalogCache::bump());
    }

    protected $fillable = [
        'name',
        'series',
        'character',
        'price',
        'sale_price',
        'images',
        'category',
        'collection',
        'figure_type',
        'condition',
        'in_stock',
        'is_featured',
        'date_added',
        'description',
        'manufacturer',
        'scale',
        'release_date',
        'estimated_arrival',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'in_stock' => 'boolean',
        'is_featured' => 'boolean',
        'date_added' => 'date',
    ];

    /** Shape matching the frontend's `Product` interface (resources/js/data/products.ts). */
    /**
     * Slim version for the storefront list: no description and only the first photo, because the list
     * carries every product. The full record (all photos, description) comes from /api/products/{id}.
     */
    public function toListItem(): array
    {
        return array_merge($this->toFrontend(), [
            'images' => array_slice($this->images ?? [], 0, 1),
            'description' => '',
            'manufacturer' => '',
            'releaseDate' => null,
        ]);
    }

    public function toFrontend(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'series' => $this->series,
            'character' => $this->character ?? '',
            'price' => (float) $this->price,
            'salePrice' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'images' => $this->images ?? [],
            'category' => $this->category,
            'collection' => $this->collection,
            'figureType' => $this->figure_type,
            'condition' => $this->condition,
            'inStock' => $this->in_stock,
            'isFeatured' => $this->is_featured,
            'dateAdded' => $this->date_added?->format('Y-m-d'),
            'description' => $this->description ?? '',
            'manufacturer' => $this->manufacturer ?? '',
            'scale' => $this->scale,
            'releaseDate' => $this->release_date,
            'estimatedArrival' => $this->estimated_arrival,
        ];
    }
}
