<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private function rules(Request $request, ?Product $product = null): array
    {
        return [
            // A listing is identified by name + series + condition (same key the seeders and the DB unique index use).
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('products', 'name')
                    ->where('series', $request->input('series'))
                    ->where('condition', $request->input('condition'))
                    ->ignore($product?->id),
            ],
            'series' => 'required|string|max:255',
            'character' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'salePrice' => 'nullable|numeric|min:0',
            'images' => 'array',
            'images.*' => 'string|url|max:2048',
            'category' => 'required|string|in:on-hand,pre-order,new-release',
            'condition' => 'required|string|in:New,Pre-owned,Loose,Sealed',
            'inStock' => 'required|boolean',
            'isFeatured' => 'boolean',
            'dateAdded' => 'nullable|date',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'scale' => 'nullable|string|max:60',
            'releaseDate' => 'nullable|string|max:60',
            'estimatedArrival' => 'nullable|string|max:60',
        ];
    }

    private const MESSAGES = [
        'name.unique' => 'A listing with this name, series and condition already exists.',
    ];

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
            'in_stock' => $data['inStock'],
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
        $data = $request->validate($this->rules($request), self::MESSAGES);
        $product = Product::create($this->mapped($data));

        return response()->json($product->toFrontend(), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate($this->rules($request, $product), self::MESSAGES);
        $product->update($this->mapped($data));

        return response()->json($product->fresh()->toFrontend());
    }

    /** One-click In Stock / Out of Stock switch used by the admin table. */
    public function setStock(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['inStock' => 'required|boolean']);
        $product->update(['in_stock' => $data['inStock']]);

        return response()->json($product->toFrontend());
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['deleted' => true]);
    }
}
