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
     * Upload an image file to Cloudflare R2 and return its public URL.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // 5MB max, images only
            'file' => 'required|image|max:5120',
        ]);

        $file = $request->file('file');
        $filename = 'banners/'.Str::uuid().'.'.$file->getClientOriginalExtension();

        Storage::disk('r2')->put($filename, file_get_contents($file), 'public');

        return response()->json([
            'url' => Storage::disk('r2')->url($filename),
        ], 201);
    }
}