<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnimeCover;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimeCoverController extends Controller
{
    /** Every anime series that has products, with its cover (null when none is set yet). */
    public function index(): JsonResponse
    {
        $covers = AnimeCover::pluck('image_url', 'series');

        $series = Product::query()
            ->whereNotNull('series')
            ->where('series', '!=', '')
            ->distinct()
            ->orderBy('series')
            ->pluck('series');

        return response()->json($series->map(fn (string $name) => [
            'series' => $name,
            'image' => $covers[$name] ?? null,
        ])->values());
    }

    /** Set or clear (image = null) the cover for one series. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'series' => 'required|string|max:255',
            'image' => 'nullable|string|url:https|max:2048',
        ]);

        AnimeCover::updateOrCreate(
            ['series' => $data['series']],
            ['image_url' => $data['image'] ?: null],
        );

        return response()->json(['series' => $data['series'], 'image' => $data['image'] ?: null]);
    }
}
