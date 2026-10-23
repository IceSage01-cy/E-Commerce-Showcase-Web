<?php

use App\Http\Middleware\EnsureAdminAuthenticated;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.auth' => EnsureAdminAuthenticated::class,
        ]);

        $middleware->web(append: [
            SecurityHeaders::class,
        ]);

        // Render terminates SSL and forwards requests over HTTP from its own proxy. Only that directly
        // connected proxy is trusted. Trusting every address would let a visitor set their own
        // X-Forwarded-For header and get around the per-IP rate limits (login especially).
        $middleware->trustProxies(
            at: ['REMOTE_ADDR'],
            headers: Request::HEADER_X_FORWARDED_FOR |
                Request::HEADER_X_FORWARDED_HOST |
                Request::HEADER_X_FORWARDED_PORT |
                Request::HEADER_X_FORWARDED_PROTO,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
