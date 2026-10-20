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
<<<<<<< HEAD
        'font',
        'style',
=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
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
<<<<<<< HEAD
            'font' => $this->font ?? 'Outfit',
            'style' => $this->style ?? 'classic',
=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
            'image' => $this->image_url,
            'sortOrder' => $this->sort_order,
        ];
    }
}
