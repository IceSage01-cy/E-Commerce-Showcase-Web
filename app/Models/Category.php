<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A main storefront category (Anime Figures, Scale Figures, ...) with an admin-managed background picture. */
class Category extends Model
{
    protected $fillable = [
        'slug',
        'label',
        'sublabel',
        'description',
        'accent',
        'style',
        'image_url',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function toFrontend(): array
    {
        return [
            'id' => (string) $this->id,
            'slug' => $this->slug,
            'label' => $this->label,
            'sublabel' => $this->sublabel ?? '',
            'description' => $this->description ?? '',
            'accent' => $this->accent,
            'style' => $this->style ?? 'classic',
            'image' => $this->image_url,
            'sortOrder' => $this->sort_order,
        ];
    }
}
