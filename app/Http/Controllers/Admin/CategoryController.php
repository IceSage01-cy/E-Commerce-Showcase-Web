<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /** Slugs the storefront already uses as page names; a category may not take them. */
    private const RESERVED_SLUGS = ['home', 'cart', 'new-arrivals', 'on-hand', 'pre-order', 'new-release'];

    private function rules(): array
    {
        return [
            'label' => 'required|string|max:80',
            'sublabel' => 'nullable|string|max:120',
            'description' => 'nullable|string|max:300',
            'image' => 'nullable|string|url:https|max:2048',
            'accent' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'style' => ['nullable', Rule::in(config('catalog.category_styles'))],
        ];
    }

    /** Two categories with the same name would be indistinguishable in the shop and in the product form. */
    private function assertNameIsFree(string $label, ?int $ignoreId = null): void
    {
        $taken = Category::whereRaw('lower(label) = ?', [mb_strtolower(trim($label))])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages(['label' => 'A category with this name already exists.']);
        }
    }

    private function uniqueSlug(string $label): string
    {
        $base = Str::slug($label) ?: 'category';
        $slug = $base;
        $n = 2;

        while (in_array($slug, self::RESERVED_SLUGS, true) || Category::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }

    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('sort_order')->orderBy('id')->get()->map->toFrontend());
    }

    /** Add a new main category. It appears last on the homepage and as a choice in the product form. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $label = trim($data['label']);
        $this->assertNameIsFree($label);

        $category = Category::create([
            'slug' => $this->uniqueSlug($label),
            'label' => $label,
            'sublabel' => $data['sublabel'] ?? '',
            'description' => $data['description'] ?? '',
            'image_url' => $data['image'] ?? null,
            'accent' => strtoupper($data['accent'] ?? '#FF2D78'),
            'style' => $data['style'] ?? 'classic',
            'sort_order' => ((int) Category::max('sort_order')) + 1,
        ]);

        return response()->json($category->toFrontend(), 201);
    }

    /** Edit a category's text, picture and look. The slug never changes, so products stay filed where they were. */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate($this->rules());
        $label = trim($data['label']);
        $this->assertNameIsFree($label, $category->id);

        $category->update([
            'label' => $label,
            'sublabel' => $data['sublabel'] ?? '',
            'description' => $data['description'] ?? '',
            'image_url' => $data['image'] ?? null,
            'accent' => strtoupper($data['accent'] ?? $category->accent),
            'style' => $data['style'] ?? $category->style,
        ]);

        return response()->json($category->fresh()->toFrontend());
    }

    /**
     * Delete a category. Products can't be left without one, so if any are filed under it the request
     * must say where to move them (`moveTo` = slug of another category).
     */
    public function destroy(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate(['moveTo' => 'nullable|string']);

        if (Category::count() <= 1) {
            throw ValidationException::withMessages(['category' => 'You need to keep at least one category.']);
        }

        $count = Product::where('collection', $category->slug)->count();
        $target = null;

        if ($count > 0) {
            $target = ! empty($data['moveTo'])
                ? Category::where('slug', $data['moveTo'])->where('id', '!=', $category->id)->first()
                : null;

            if (! $target) {
                throw ValidationException::withMessages([
                    'moveTo' => "{$count} product(s) are filed under \"{$category->label}\". Choose another category to move them to.",
                ]);
            }
        }

        DB::transaction(function () use ($category, $target, $count) {
            if ($count > 0) {
                // Query-builder update: set updated_at ourselves so the moved products float to the top of the admin list.
                Product::where('collection', $category->slug)
                    ->update(['collection' => $target->slug, 'updated_at' => now()]);
            }

            $category->delete();
        });

        CatalogCache::bump();

        return response()->json(['deleted' => true, 'moved' => $count, 'movedTo' => $target?->slug]);
    }
}
