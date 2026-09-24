<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('q')) {
            $term = '%'.$request->string('q').'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('series', 'like', $term)
                    ->orWhere('character', 'like', $term);
            });
        }

        $products = $query->orderByDesc('date_added')->get()->map->toFrontend();

        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->toFrontend());
    }
}
