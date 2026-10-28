<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class ImageProxyController extends Controller
{
    /**
     * Streams an image from our R2 bucket through our own origin, so the receipt export (html2canvas)
     * can draw it without tainting the canvas. It only fetches from the configured R2 host, never
     * from a caller-supplied address.
     */
    public function show(Request $request): Response
    {
        $request->validate(['url' => 'required|url']);

        $url = $request->string('url')->toString();
        $allowedHost = parse_url((string) config('filesystems.disks.r2.url'), PHP_URL_HOST);
        $requestedHost = parse_url($url, PHP_URL_HOST);

        if (! $allowedHost || $requestedHost !== $allowedHost) {
            abort(403, 'This URL is not allowed.');
        }

        // Don't follow redirects: the host check above only applies to the URL the caller sent.
        $response = Http::timeout(8)->withoutRedirecting()->get($url);

        $contentType = (string) $response->header('Content-Type');

        if (! $response->successful() || ! str_starts_with(strtolower($contentType), 'image/')) {
            abort(502, 'Could not fetch the image.');
        }

        return response($response->body())
            ->header('Content-Type', $contentType)
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
