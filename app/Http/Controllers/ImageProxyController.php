<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class ImageProxyController extends Controller
{
    /**
     * Streams an image from our own R2 bucket back through our own origin.
     *
     * This exists so client-side canvas capture (html2canvas, used for the
     * downloadable order receipt) isn't blocked by the browser's
     * cross-origin canvas restrictions — those only allow reading pixel
     * data back out of a canvas once every image drawn onto it was loaded
     * either same-origin or with a CORS header we don't control on R2.
     * Routing the request through our own domain sidesteps that instead of
     * depending on R2's CORS configuration.
     *
     * Only ever fetches from our own configured R2 public URL — never an
     * arbitrary URL supplied by the caller — so this can't be used as an
     * open SSRF proxy.
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

        $response = Http::timeout(8)->get($url);

        if (! $response->successful()) {
            abort(502, 'Could not fetch the image.');
        }

        return response($response->body())
            ->header('Content-Type', $response->header('Content-Type', 'image/jpeg'))
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
