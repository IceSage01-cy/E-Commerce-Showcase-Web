<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /** Upload an image to Cloudflare R2 and return its public URL. */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // Images only, 5 MB max.
            'file' => 'required|image|max:5120',
            // Folder in the bucket ("products", "banners"). A plain slug, so nothing is written outside it.
            'folder' => 'nullable|string|max:40|regex:/^[a-z0-9_-]+$/i',
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');
        // The extension comes from the detected file type, not from the client's file name.
        $filename = $folder.'/'.Str::uuid().'.'.($file->extension() ?: 'bin');

        try {
            $written = Storage::disk('r2')->put($filename, file_get_contents($file), 'public');
        } catch (\Throwable $e) {
            // A wrong or missing R2_* setting throws here.
            Log::error('R2 upload failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'The photo could not be uploaded right now. Try again in a moment, or paste a link to the photo instead.',
            ], 500);
        }

        // put() can also return false without throwing; only return a URL for a file that was written.
        if (! $written) {
            Log::error('R2 upload returned false without throwing', ['filename' => $filename]);

            return response()->json([
                'message' => 'The photo could not be uploaded right now. Try again in a moment, or paste a link to the photo instead.',
            ], 500);
        }

        return response()->json([
            'url' => Storage::disk('r2')->url($filename),
        ], 201);
    }
}
