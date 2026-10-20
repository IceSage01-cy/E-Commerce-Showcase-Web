<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('sort_order')->orderBy('id')->get()->map->toFrontend());
    }

    /** The four main categories are fixed (they are what products are filed under); their picture and text are editable. */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'label' => 'required|string|max:80',
            'sublabel' => 'nullable|string|max:120',
            'description' => 'nullable|string|max:300',
            'image' => 'nullable|string|url|max:2048',
            'accent' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'font' => ['required', Rule::in(config('catalog.category_fonts'))],
            'style' => ['required', Rule::in(config('catalog.category_styles'))],
        ]);

        $category->update([
            'label' => $data['label'],
            'sublabel' => $data['sublabel'] ?? '',
            'description' => $data['description'] ?? '',
            'image_url' => $data['image'] ?? null,
            'accent' => strtoupper($data['accent']),
            'font' => $data['font'],
            'style' => $data['style'],
        ]);

        return response()->json($category->fresh()->toFrontend());
    }
}
