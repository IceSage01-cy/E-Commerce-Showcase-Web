<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('is_admin')) {
            // Browsers navigating to /admin get bounced to the login page; the admin UI's own
            // fetch/axios calls get a real 401 instead. Otherwise an expired session makes
            // axios silently follow the redirect and treat the login HTML as a "successful" save.
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your admin session has expired. Please log in again.'], 401);
            }

            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
