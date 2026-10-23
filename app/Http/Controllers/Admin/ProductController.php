<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogCache;
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
            'images' => 'required|array|min:1',
            'images.*' => 'string|url:https|max:2048',
            // Listing type (availability): on-hand / pre-order / new-release.
            'category' => 'required|string|in:on-hand,pre-order,new-release',
            // Main storefront category: any category that exists (managed in Admin -> Categories).
            'collection' => ['required', 'string', Rule::in(Category::pluck('slug')->all())],
            // Prize / Scale split. Required for the CHIX Figures collection; optional elsewhere.
            'figureType' => [
                Rule::requiredIf($request->input('collection') === config('catalog.chix_collection')),
                'nullable', 'string', Rule::in(config('catalog.figure_types')),
            ],
            'condition' => ['required', 'string', Rule::in(config('catalog.conditions'))],
            'inStock' => 'required|boolean',
            'isFeatured' => 'boolean',
            'isNendoroid' => 'boolean',
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
        'figureType.required' => 'Pick a CHIX figure type (Prize or Scale).',
        'images.required' => 'Add at least one photo.',
        'images.min' => 'Add at least one photo.',
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
            'collection' => $data['collection'],
            'figure_type' => $data['collection'] === config('catalog.scale_collection') ? null : ($data['figureType'] ?? null),
            'condition' => $data['condition'],
            'in_stock' => $data['inStock'],
            'is_featured' => $data['isFeatured'] ?? false,
            'is_nendoroid' => $data['isNendoroid'] ?? false,
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
        // Most recently changed first, so a product you just edited (or toggled) is at the top of the list.
        $products = Product::orderByDesc('updated_at')->orderByDesc('id')->get()->map->toFrontend();

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

    /** One-click Featured ("Japan New Arrivals") switch used by the admin table. */
    public function setFeatured(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['isFeatured' => 'required|boolean']);
        $product->update(['is_featured' => $data['isFeatured']]);

        return response()->json($product->toFrontend());
    }

    /**
     * Apply one action to many products at once, so large batches don't need one
     * edit form per product.
     */
    public function bulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1|max:1000',
            'ids.*' => 'integer',
            'action' => ['required', Rule::in(['feature', 'unfeature', 'in_stock', 'out_of_stock', 'delete'])],
        ]);

        $ids = array_values(array_unique(array_map('intval', $data['ids'])));

        if ($data['action'] === 'delete') {
            $deleted = Product::whereIn('id', $ids)->pluck('id')->map(fn ($id) => (string) $id)->all();
            Product::whereIn('id', $ids)->delete();
            CatalogCache::bump();

            return response()->json(['deleted' => $deleted]);
        }

        $changes = match ($data['action']) {
            'feature' => ['is_featured' => true],
            'unfeature' => ['is_featured' => false],
            'in_stock' => ['in_stock' => true],
            'out_of_stock' => ['in_stock' => false],
        };

        // Query-builder updates don't touch updated_at on their own; set it so these float to the top of the list.
        Product::whereIn('id', $ids)->update($changes + ['updated_at' => now()]);
        CatalogCache::bump();

        return response()->json([
            'products' => Product::whereIn('id', $ids)->orderByDesc('id')->get()->map->toFrontend(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['deleted' => true]);
    }
}
