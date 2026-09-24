<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Store a dropped/selected image on the public disk and hand back a URL
     * the frontend can drop straight into a product or banner's image list.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:5120', // 5MB
        ]);

        $file = $request->file('file');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $filename, 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
        ], 201);
    }
}
