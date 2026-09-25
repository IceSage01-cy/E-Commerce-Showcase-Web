<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    private function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'cta' => 'required|string|max:60',
            'ctaAction' => 'required|string|max:60',
            'image' => 'required|string|url|max:2048',
            'accent' => 'required|string|max:7',
            'sortOrder' => 'nullable|integer|min:0',
            'isActive' => 'boolean',
        ];
    }

    private function mapped(array $data): array
    {
        return [
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? '',
            'cta_label' => $data['cta'],
            'cta_action' => $data['ctaAction'],
            'image_url' => $data['image'],
            'accent' => $data['accent'],
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_active' => $data['isActive'] ?? true,
        ];
    }

    public function index(): JsonResponse
    {
        $banners = Banner::orderBy('sort_order')->get()->map->toFrontend();

        return response()->json($banners);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $banner = Banner::create($this->mapped($data));

        return response()->json($banner->toFrontend(), 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate($this->rules());
        $banner->update($this->mapped($data));

        return response()->json($banner->fresh()->toFrontend());
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json(['deleted' => true]);
    }
}
