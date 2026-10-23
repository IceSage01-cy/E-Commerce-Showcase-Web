<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds the standard browser hardening headers to every web response.
 *
 * The Content-Security-Policy is only sent outside local development, because the
 * Vite dev server needs its own websocket and script origins to hot-reload.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        if (! app()->environment('local')) {
            $response->headers->set('Content-Security-Policy', $this->policy());
        }

        return $response;
    }

    private function policy(): string
    {
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self'",
            // React sets inline style attributes, and the admin login page has a small inline <style> block.
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            // Product photos come from our R2 bucket and from the seeded catalogue's image hosts.
            "img-src 'self' data: blob: https:",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ]);
    }
}
