<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
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
            $term = '%'.$request->string('q').'%';
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
