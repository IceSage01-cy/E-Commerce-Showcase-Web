<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'cta_label',
        'cta_action',
        'image_url',
        'accent',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /** Shape matching the frontend's HeroSlider `slide` object. */
    public function toFrontend(): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'cta' => $this->cta_label,
            'ctaAction' => $this->cta_action,
            'image' => $this->image_url,
            'accent' => $this->accent,
            'isActive' => $this->is_active,
            'sortOrder' => $this->sort_order,
        ];
    }
}
