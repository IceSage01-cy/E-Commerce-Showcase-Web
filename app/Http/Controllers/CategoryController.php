<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /** Public: main categories with their background pictures, in display order. */
    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('sort_order')->orderBy('id')->get()->map->toFrontend());
    }
}
