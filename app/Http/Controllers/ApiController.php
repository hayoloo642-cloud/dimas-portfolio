<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Support\AdminAuth;
use App\Support\ContentRepository;
use App\Support\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApiController extends Controller
{
    public function __construct(
        protected AdminAuth $auth,
        protected ContentRepository $content,
    ) {
        $this->auth->ensureSeeded();
    }

    protected function token(Request $request): ?string
    {
        return $request->header('x-admin-token') ?: $request->input('_token');
    }

    public function meta(Request $request)
    {
        $authed = $this->auth->isAdmin($this->token($request));

        return response()->json([
            'openEdit' => $this->auth->openEdit(),
            'authed' => $authed,
            'canEdit' => $authed || $this->auth->openEdit(),
            'updatedAt' => $this->content->all()['updatedAt'] ?? 0,
        ]);
    }

    public function login(Request $request)
    {
        $key = 'admin-login:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 12)) {
            return response()->json(['error' => 'Terlalu banyak percobaan. Coba lagi nanti.'], 429);
        }

        $password = (string) $request->input('password', '');

        if (! $this->auth->check($password)) {
            RateLimiter::hit($key, 600);

            return response()->json(['error' => 'Password salah'], 401);
        }

        RateLimiter::clear($key);

        return response()->json(['token' => $this->auth->token()]);
    }

    public function session(Request $request)
    {
        return response()->json(['authed' => $this->auth->isAdmin($this->token($request))]);
    }

    public function content()
    {
        return response()->json($this->content->all());
    }

    /**
     * Localised content document. Strings are translated once and cached in
     * the translations table, so admin text added later is covered too.
     */
    public function translated(Request $request, TranslationService $translator)
    {
        $locale = (string) $request->query('locale', 'id');

        if (! in_array($locale, ['id', 'en'], true)) {
            $locale = 'id';
        }

        $document = $this->content->all();

        if ($locale === 'id') {
            return response()->json($document);
        }

        Cache::forget('site-content-'.$locale);

        return response()->json($translator->translateDocument($document, $locale));
    }

    public function visit(Request $request)
    {
        $token = substr(hash('sha256', (string) ($request->input('token') ?: $request->ip())), 0, 40);

        $exists = \App\Models\Visit::query()->where('token', $token)->exists();

        if (! $exists) {
            try {
                \App\Models\Visit::query()->create(['token' => $token]);
            } catch (\Throwable $e) {
                // duplicate request — ignore
            }
        }

        return response()->json([
            'count' => \App\Models\Visit::query()->count(),
            'returning' => $exists,
        ]);
    }

    public function updateContent(Request $request)
    {
        if (! $this->auth->canEdit($this->token($request))) {
            return response()->json(['error' => 'Tidak punya izin'], 401);
        }

        $data = $request->json()->all();

        if (! is_array($data) || array_is_list($data)) {
            return response()->json(['error' => 'Data tidak valid'], 400);
        }

        // drop runtime-only keys before storing
        unset($data['updatedAt']);

        $saved = $this->content->save($data);
        Cache::forget('site-content');

        return response()->json(['ok' => true, 'updatedAt' => $saved['updatedAt']]);
    }

    public function saveSettings(Request $request)
    {
        if (! $this->auth->isAdmin($this->token($request))) {
            return response()->json(['error' => 'Tidak punya izin'], 401);
        }

        if ($request->has('openEdit')) {
            \App\Models\Setting::put('open_edit', $request->boolean('openEdit') ? '1' : '0');
        }

        $newPassword = (string) $request->input('newPassword', '');

        if ($newPassword !== '') {
            if (strlen($newPassword) < 6) {
                return response()->json(['error' => 'Password minimal 6 karakter'], 400);
            }

            $this->auth->changePassword($newPassword);
        }

        return response()->json([
            'ok' => true,
            'openEdit' => $this->auth->openEdit(),
        ]);
    }

    public function upload(Request $request)
    {
        if (! $this->auth->canEdit($this->token($request))) {
            return response()->json(['error' => 'Tidak punya izin'], 401);
        }

        $dataUrl = (string) $request->input('dataUrl', '');

        if (! preg_match('#^data:(image/(png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=\s]+)$#', $dataUrl, $m)) {
            return response()->json(['error' => 'Gambar tidak valid'], 400);
        }

        $ext = [
            'image/png' => 'png',
            'image/jpeg' => 'jpg',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/svg+xml' => 'svg',
        ][$m[1]];

        $binary = base64_decode(preg_replace('/\s+/', '', $m[3]), true);

        if ($binary === false) {
            return response()->json(['error' => 'Gambar tidak valid'], 400);
        }

        if (strlen($binary) > (int) config('portfolio.max_upload')) {
            return response()->json(['error' => 'Maksimal 8MB'], 400);
        }

        $name = substr(hash('sha256', $binary), 0, 20).'-'.base_convert((string) time(), 10, 36).'.'.$ext;

        Storage::disk('public')->put('uploads/'.$name, $binary);

        Media::query()->create([
            'path' => 'uploads/'.$name,
            'mime' => $m[1],
            'size' => strlen($binary),
        ]);

        return response()->json(['url' => '/storage/uploads/'.$name]);
    }

    public function health()
    {
        return response()->json(['ok' => true, 'uptime' => (int) (microtime(true) - (float) ($_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true)))]);
    }
}
