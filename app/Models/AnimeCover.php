<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Cover picture for one anime series. `series` matches products.series. */
class AnimeCover extends Model
{
    protected $fillable = ['series', 'image_url'];
}
