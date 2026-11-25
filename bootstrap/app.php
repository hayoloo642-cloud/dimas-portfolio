<?php

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
        // Situs dilayani lewat Cloudflare Tunnel, jadi nginx hanya melihat
        // koneksi dari localhost. Percayai header X-Forwarded-* dari
        // Cloudflare agar skema HTTPS dan IP asli pengunjung terbaca benar.
        $middleware->trustProxies(at: '*');

        // The bundled front-end talks to the JSON API exactly like the old
        // zero-dependency Node server did: auth is an HMAC header, not a
        // cookie session, so CSRF tokens do not apply here.
        $middleware->validateCsrfTokens(except: ['api/*', 'kelola', 'uploads/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
