<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\SiteController;
use App\Support\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/* ---------------- public site ---------------- */
Route::get('/', [SiteController::class, 'index'])->name('home');

/* ---------------- JSON API (same contract as the Node server) ---------------- */
Route::prefix('api')->group(function () {
    Route::get('meta', [ApiController::class, 'meta']);
    Route::post('login', [ApiController::class, 'login']);
    Route::get('session', [ApiController::class, 'session']);
    Route::get('content', [ApiController::class, 'content']);
    Route::get('content/translated', [ApiController::class, 'translated']);
    Route::post('visit', [ApiController::class, 'visit']);
    Route::put('content', [ApiController::class, 'updateContent']);
    Route::post('settings', [ApiController::class, 'saveSettings']);
    Route::post('upload', [ApiController::class, 'upload']);
    Route::get('health', [ApiController::class, 'health']);
});

/* ---------------- hidden admin panel ---------------- */
$adminPath = trim((string) config('portfolio.admin_path'), '/');

Route::get($adminPath, [AdminController::class, 'index'])->name('admin');

// The public page only knows this harmless alias, so the real panel path is
// never exposed in the HTML source. It simply redirects server-side.
Route::get('kelola', fn () => redirect('/'.$adminPath));

/* ---------------- legacy uploads path (old JSON links may still exist) ---------------- */
Route::get('uploads/{file}', function (string $file) {
    abort_unless(preg_match('/^[A-Za-z0-9_.-]+$/', $file), 404);
    $path = storage_path('app/public/uploads/'.$file);
    abort_unless(is_file($path), 404);

    return response()->file($path, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('file', '.+');

/* ---------------- GitHub integration (server-side proxy, cached) ---------------- */
Route::get('api/github/{user}', function (string $user) {
    abort_unless(preg_match('/^[A-Za-z0-9-]{1,39}$/', $user), 404);

    return response()->json(
        \Illuminate\Support\Facades\Cache::remember('gh:'.$user, 900, function () use ($user) {
            $client = \Illuminate\Support\Facades\Http::withHeaders([
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => 'Dimas-Portfolio',
            ])->timeout(10);

            $profile = $client->get('https://api.github.com/users/'.$user);

            if (! $profile->ok()) {
                return ['error' => 'not_found'];
            }

            $repos = $client->get('https://api.github.com/users/'.$user.'/repos', [
                'per_page' => 6,
                'sort' => 'updated',
            ]);

            $list = collect($repos->ok() ? $repos->json() : [])
                ->reject(fn ($r) => ($r['fork'] ?? false))
                ->map(fn ($r) => [
                    'name' => $r['name'] ?? '',
                    'url' => $r['html_url'] ?? '',
                    'description' => $r['description'] ?? '',
                    'language' => $r['language'] ?? '',
                    'stars' => $r['stargazers_count'] ?? 0,
                    'updated' => $r['updated_at'] ?? '',
                ])
                ->values()
                ->all();

            $p = $profile->json();

            return [
                'user' => $p['login'] ?? $user,
                'name' => $p['name'] ?? '',
                'avatar' => $p['avatar_url'] ?? '',
                'bio' => $p['bio'] ?? '',
                'url' => $p['html_url'] ?? 'https://github.com/'.$user,
                'repos' => $list,
                'publicRepos' => $p['public_repos'] ?? 0,
                'followers' => $p['followers'] ?? 0,
            ];
        })
    );
});

