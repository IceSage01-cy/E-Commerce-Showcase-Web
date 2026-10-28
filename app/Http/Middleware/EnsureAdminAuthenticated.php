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
            // Page visits go to the login page. The admin UI's own requests get a 401 instead,
            // so an expired session is not mistaken for a saved change.
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your admin session has expired. Please log in again.'], 401);
            }

            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
