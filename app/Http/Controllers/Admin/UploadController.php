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
    /**
     * Upload an image file to Cloudflare R2 and return its public URL.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // 5MB max, images only
            'file' => 'required|image|max:5120',
            // Which subfolder to file it under in the bucket, e.g. "products"
            // or "banners". Restricted to a safe slug so it can't be used to
            // write outside the intended prefix.
            'folder' => 'nullable|string|max:40|regex:/^[a-z0-9_-]+$/i',
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');
        // Derive the extension from the file's actual detected content type,
        // not the client-supplied filename — a renamed file (e.g. "shell.php"
        // sent with an image MIME type) would otherwise keep an arbitrary,
        // attacker-chosen extension in the stored key.
        $filename = $folder.'/'.Str::uuid().'.'.($file->extension() ?: 'bin');

        try {
            $written = Storage::disk('r2')->put($filename, file_get_contents($file), 'public');
        } catch (\Throwable $e) {
            // With 'throw' => true on the r2 disk, a bad/missing R2_* env
            // var (wrong key, wrong bucket, wrong endpoint) lands here
            // instead of silently returning a URL for a file that was
            // never written.
            Log::error('R2 upload failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Upload failed — the storage bucket rejected the file. Check the R2 credentials in your environment settings.',
            ], 500);
        }

        // Belt-and-suspenders: put() can return false instead of throwing
        // (e.g. if 'throw' is ever disabled again, or a cached config from
        // before this fix is still in play). Never hand back a URL unless
        // the file actually landed in the bucket.
        if (! $written) {
            Log::error('R2 upload returned false without throwing', ['filename' => $filename]);

            return response()->json([
                'message' => 'Upload failed — the storage bucket rejected the file. Check the R2 credentials in your environment settings.',
            ], 500);
        }

        return response()->json([
            'url' => Storage::disk('r2')->url($filename),
        ], 201);
    }
}