<?php

namespace App\Http\Controllers;

use App\Models\AnimeCover;
use Illuminate\Http\JsonResponse;

class AnimeCoverController extends Controller
{
    /** Public: series name => cover picture URL, for every series that has a cover. */
    public function index(): JsonResponse
    {
        $covers = AnimeCover::whereNotNull('image_url')->pluck('image_url', 'series');

        return response()->json($covers);
    }
}
