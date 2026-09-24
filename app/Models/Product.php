<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'series',
        'character',
        'price',
        'sale_price',
        'images',
        'category',
        'condition',
        'stock',
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
        'stock' => 'integer',
        'is_featured' => 'boolean',
        'date_added' => 'date',
    ];

    /** Shape matching the frontend's `Product` interface (resources/js/data/products.ts). */
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
            'condition' => $this->condition,
            'stock' => $this->stock,
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
