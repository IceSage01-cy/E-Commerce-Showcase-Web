<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'series' => 'required|string|max:255',
            'character' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'salePrice' => 'nullable|numeric|min:0',
            'images' => 'array',
            'images.*' => 'string',
            'category' => 'required|string|in:on-hand,pre-order,new-release',
            'condition' => 'required|string|in:New,Pre-owned,Loose,Sealed',
            'stock' => 'required|integer|min:0',
            'isFeatured' => 'boolean',
            'dateAdded' => 'nullable|date',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'scale' => 'nullable|string|max:60',
            'releaseDate' => 'nullable|string|max:60',
            'estimatedArrival' => 'nullable|string|max:60',
        ];
    }

    private function mapped(array $data): array
    {
        return [
            'name' => $data['name'],
            'series' => $data['series'],
            'character' => $data['character'] ?? '',
            'price' => $data['price'],
            'sale_price' => $data['salePrice'] ?? null,
            'images' => array_values(array_filter($data['images'] ?? [])),
            'category' => $data['category'],
            'condition' => $data['condition'],
            'stock' => $data['stock'],
            'is_featured' => $data['isFeatured'] ?? false,
            'date_added' => $data['dateAdded'] ?? now()->format('Y-m-d'),
            'description' => $data['description'] ?? '',
            'manufacturer' => $data['manufacturer'] ?? '',
            'scale' => $data['scale'] ?? null,
            'release_date' => $data['releaseDate'] ?? null,
            'estimated_arrival' => $data['estimatedArrival'] ?? null,
        ];
    }

    public function index(): JsonResponse
    {
        $products = Product::orderByDesc('date_added')->get()->map->toFrontend();

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $product = Product::create($this->mapped($data));

        return response()->json($product->toFrontend(), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate($this->rules());
        $product->update($this->mapped($data));

        return response()->json($product->fresh()->toFrontend());
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['deleted' => true]);
    }
}
