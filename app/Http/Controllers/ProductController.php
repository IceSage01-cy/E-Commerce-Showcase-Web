<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['q' => ['nullable', 'string', 'max:100']]);

        // An unknown category or collection (e.g. a deleted one, from an old link) gets an empty list,
        // not an error. Only known values reach the cache, so arbitrary strings can't fill it.
        $knownCategories = ['on-hand', 'pre-order', 'new-release'];
        $knownCollections = Category::pluck('slug')->all();
        $category = (string) $request->input('category', '');
        $collection = (string) $request->input('collection', '');

        if (
            ($category !== '' && ! in_array($category, $knownCategories, true))
            || ($collection !== '' && ! in_array($collection, $knownCollections, true))
        ) {
            return response('[]', 200, ['Content-Type' => 'application/json']);
        }

        $query = Product::query();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('collection')) {
            $query->where('collection', $request->string('collection'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('q')) {
            // Escape LIKE wildcards so the search text is matched literally.
            $escaped = addcslashes($request->string('q')->toString(), '%_\\');
            $term = '%'.$escaped.'%';
            // PostgreSQL's LIKE is case-sensitive (MySQL/SQLite's is not), so use ILIKE there.
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($term, $like) {
                $q->where('name', $like, $term)
                    ->orWhere('series', $like, $term)
                    ->orWhere('character', $like, $term);
            });
        }

        $build = fn () => $query->orderByDesc('date_added')->orderByDesc('id')->get()
            ->map->toListItem()->toJson();

        // Searches are one-off, so only the plain list / filtered lists are cached.
        $body = $request->filled('q')
            ? $build()
            : CatalogCache::remember(http_build_query($request->only(['category', 'collection', 'featured'])), $build);

        $response = response($body, 200, ['Content-Type' => 'application/json']);
        // Browsers may reuse it for a minute and re-check cheaply (ETag -> 304) after that.
        $response->setEtag(md5($body));
        $response->headers->set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        $response->isNotModified($request);

        return $response;
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->toFrontend());
    }
}
