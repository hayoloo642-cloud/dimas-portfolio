<?php

namespace App\Support;

use App\Models\Translation;
use Illuminate\Support\Facades\Http;

/**
 * On-demand document translator (Indonesian ⇄ English).
 *
 * Every string is cached in the `translations` table keyed by a hash of
 * locale+source, so text added later through the admin panel is translated
 * automatically the first time the English site is opened, then served from
 * the database.
 */
class TranslationService
{
    /** Keys whose values are never human language. */
    protected array $skipKeys = [
        'icon', 'image', 'portrait', 'url', 'resumeUrl', 'email', 'phone',
        'no', 'hash', 'mode', 'accent', 'paper', 'updatedAt', 'visits',
    ];

    /** Common strings we prefer to control ourselves. */
    protected array $glossary = [
        'profil' => 'Profile',
        'biografi' => 'Biography',
        'prestasi' => 'Achievements',
        'sertifikat' => 'Certificates',
        'galeri' => 'Gallery',
        'kontak' => 'Contact',
        'keahlian' => 'Skills',
        'kelola' => 'Manage',
        'kembali ke atas' => 'Back to top',
        'kunjungan' => 'Visits',
        'siswa' => 'Student',
        'bali, indonesia' => 'Bali, Indonesia',
        'riwayat singkat' => 'Short history',
        'riwayat pendidikan' => 'Education history',
        'pendidikan' => 'Education',
        'nama lengkap' => 'Full name',
        'nama' => 'Name',
        'lahir' => 'Born',
        'profesi' => 'Profession',
        'minat' => 'Interests',
        'lokasi' => 'Location',
        'terima kasih sudah' => 'Thank you for',
        'mampir!' => 'stopping by!',
        'halo aku dimas!' => "Hi, I'm Dimas!",
        'halo, aku' => 'Hello, I am',
        'dimas!' => 'Dimas!',
        'yang aku' => 'What I',
        'pelajari' => 'learn',
        'bukti' => 'Proof',
        'belajar' => 'learning',
        'potret' => 'Portraits',
        'geser untuk melihat →' => 'Swipe to explore →',
        'klik untuk membuka' => 'Click to open',
        'sertifikat segera hadir.' => 'Certificates coming soon.',
        'potret segera hadir.' => 'Portraits coming soon.',
        'galeri masih kosong' => 'Gallery is still empty',
        'tambahkan potret lewat panel admin.' => 'Add portraits through the admin panel.',
        'siswa · coding & design' => 'Student · Coding & Design',
        'coding & design' => 'Coding & Design',
        'proyek pribadi' => 'Personal project',
        'pentas seni' => 'School art show',
        'ui & grafis' => 'UI & Graphics',
        'membangun proyek web dan bereksperimen dengan teknologi baru.' => 'Building web projects and experimenting with new technology.',
        'merancang antarmuka dan visual yang bersih serta mudah dipakai.' => 'Designing clean, easy-to-use interfaces and visuals.',
        'bermain musik dan tampil di panggung seni sekolah.' => 'Playing music and performing at the school art show.',
        'the question is:' => 'The Question Is:',
        'it\'s not impossible, it\'s just hard' => "it's not impossible, it's just hard",
        'it\'s not impossible. it\'s just hard.' => "It's not impossible. It's just hard.",
        'project by dp\'s project' => "Project by DP's Project",
        'project by dimas parama · © pridiprakasa' => 'Project by Dimas Parama · © Pridiprakasa',
        'bali, 27-11-2009' => 'Bali, 27-11-2009',
        'lewati' => 'Skip',
        'ganti bahasa' => 'Change language',
        'ganti tema' => 'Change theme',
        'kunjungan' => 'Visits',
        'proyek yang sedang dan pernah aku kerjakan.' => 'Projects I am working on and have worked on.',
        'hal-hal yang aku tekuni, dari menulis kode sampai menyusun tampilan.' => 'The things I focus on, from writing code to shaping interfaces.',
        'keahlian tumbuh dari rasa ingin tahu yang tidak pernah berhenti.' => 'Skill grows from curiosity that never stops.',
        'sertifikat dan penghargaan dari kursus, kompetisi, serta kegiatan yang pernah diikuti.' => 'Certificates and awards from courses, competitions, and activities I have joined.',
        'hal-hal yang sudah dikerjakan — dari coding, desain, sampai panggung seni.' => 'Things already made — from coding and design to the art stage.',
        'perjalanan kecil yang membentuk cara aku belajar, berkarya, dan melihat hal-hal baru.' => 'Small journeys that shape how I learn, create, and see new things.',
        'film & video' => 'Film & Video',
        'lainnya' => 'Other',
        '01 — profil' => '01 — Profile',
        '02 — biografi' => '02 — Biography',
        '03 — prestasi' => '03 — Achievements',
        '04 — sertifikat' => '04 — Certificates',
        '05 — keahlian' => '05 — Skills',
        '06 — the question is' => '06 — The Question Is',
        '07 — galeri' => '07 — Gallery',
        '08 — kontak' => '08 — Contact',
        'no. 001 — portrait' => 'NO. 001 — PORTRAIT',
        'kunjungan' => 'Visits',
        'bali, 27-11-2009' => 'Bali, 27-11-2009',
        'selamat datang kembali' => 'Welcome back',
        'karya terpilih' => 'Selected work',
        'project' => 'Projects',
        'yang pernah dibuat' => 'that I have built',
        'klik kartu untuk detail' => 'Click a card for details',
        'klik kartu untuk melihat detail dan foto dokumentasi.' => 'Click a card to see details and documentation photos.',
        'belum ada project' => 'No projects yet',
        'tambahkan project lewat panel admin.' => 'Add projects through the admin panel.',
        'dokumentasi' => 'Documentation',
        'peran' => 'Role',
        'tahun' => 'Year',
        'detail' => 'Details',
        'desain & kode' => 'Design & Code',
        'riset & prototipe' => 'Research & Prototyping',
        'portofolio pribadi' => 'Personal Portfolio',
        'eksperimen antarmuka' => 'Interface Experiments',
        'situs portofolio editorial satu halaman dengan panel admin tersembunyi.' => 'A one-page editorial portfolio site with a hidden admin panel.',
        'latihan merancang komponen web yang ringan dan mudah dipakai.' => 'Practice designing lightweight, easy-to-use web components.',
    ];

    public function translateDocument(array $document, string $locale = 'en'): array
    {
        if ($locale === 'id') {
            return $document;
        }

        // Pass 1: collect every translatable string, then batch them into a
        // few HTTP calls so a whole page loads fast and is cached for later.
        $this->prefetch($document, $locale);

        // Pass 2: rewrite using the now-warm cache.
        return $this->walk($document, $locale);
    }

    protected function prefetch(mixed $node, string $locale, ?string $key = null): void
    {
        $pending = [];
        $this->collect($node, $locale, $key, $pending);

        foreach (array_chunk(array_unique($pending), 40) as $chunk) {
            $this->translateMany($chunk, $locale);
        }
    }

    protected function collect(mixed $node, string $locale, ?string $key, array &$out): void
    {
        if (is_array($node)) {
            foreach ($node as $k => $v) {
                $this->collect($v, $locale, is_string($k) ? $k : null, $out);
            }

            return;
        }

        if (! is_string($node) || trim($node) === '') {
            return;
        }

        if ($key !== null && in_array($key, $this->skipKeys, true)) {
            return;
        }

        $source = trim($node);

        if (! $this->isTranslatable($source)) {
            return;
        }

        if (isset($this->glossary[strtolower($source)])) {
            return;
        }

        $out[] = $source;
    }

    protected function walk(mixed $node, string $locale, ?string $key = null): mixed
    {
        if (is_array($node)) {
            $out = [];

            foreach ($node as $k => $v) {
                $out[$k] = $this->walk($v, $locale, is_string($k) ? $k : null);
            }

            return $out;
        }

        if (! is_string($node) || trim($node) === '') {
            return $node;
        }

        if ($key !== null && in_array($key, $this->skipKeys, true)) {
            return $node;
        }

        if (! $this->isTranslatable($node)) {
            return $node;
        }

        return $this->translateString($node, $locale);
    }

    /** Only translate strings that actually contain words. */
    protected function isTranslatable(string $value): bool
    {
        if (preg_match('~^(https?://|mailto:|/storage/|assets/|data:|#)~i', trim($value))) {
            return false;
        }

        // pure numbers, dates, symbols, single words like "DIMAS"
        return (bool) preg_match('/[A-Za-z]{2,}/', $value);
    }

    public function translateString(string $source, string $locale): string
    {
        $source = trim($source);

        if ($source === '' || $locale === 'id') {
            return $source;
        }

        $key = strtolower($source);

        if (isset($this->glossary[$key])) {
            return $this->glossary[$key];
        }

        $hash = sha1($locale.'|'.$source);
        $cached = Translation::query()->where('hash', $hash)->value('target');

        if ($cached !== null) {
            return $cached;
        }

        // Batch-friendly: one string at a time here, the document walker reuses
        // the cache so a page is only translated once.
        $translated = $this->remote($source, $locale) ?? $source;

        try {
            Translation::query()->create([
                'hash' => $hash,
                'locale' => $locale,
                'source' => $source,
                'target' => $translated,
            ]);
        } catch (\Throwable $e) {
            // concurrent insert — ignore, the value is still usable
        }

        return $translated;
    }

    /** Batch translate a list of strings in one HTTP request. */
    public function translateMany(array $sources, string $locale): array
    {
        $pending = [];

        foreach ($sources as $s) {
            $s = trim((string) $s);

            if ($s === '' || $locale === 'id' || ! $this->isTranslatable($s)) {
                continue;
            }

            if (isset($this->glossary[strtolower($s)])) {
                continue;
            }

            $hash = sha1($locale.'|'.$s);

            if (Translation::query()->where('hash', $hash)->exists()) {
                continue;
            }

            $pending[$hash] = $s;
        }

        if ($pending === []) {
            return [];
        }

        $results = $this->remoteMany(array_values($pending), $locale);
        $out = [];

        foreach (array_keys($pending) as $i => $hash) {
            // No result (network failure) → return the source but do NOT cache
            // it, so the string is retried on the next request.
            if (! isset($results[$i])) {
                $out[$hash] = $pending[$hash];
                continue;
            }

            $target = $results[$i];
            $out[$hash] = $target;

            try {
                Translation::query()->create([
                    'hash' => $hash,
                    'locale' => $locale,
                    'source' => $pending[$hash],
                    'target' => $target,
                ]);
            } catch (\Throwable $e) {
                // ignore duplicate races
            }
        }

        return $out;
    }

    protected function remote(string $text, string $locale): ?string
    {
        $res = $this->remoteMany([$text], $locale);

        return $res[0] ?? null;
    }

    protected function remoteMany(array $texts, string $locale): array
    {
        if ($texts === []) {
            return [];
        }

        $url = 'https://translate.googleapis.com/translate_a/t';

        // Google expects repeated `q` parameters, not q[]=…
        $query = 'client=gtx&sl=id&tl='.urlencode($locale)
            .'&'.implode('&', array_map(
                fn ($t) => 'q='.urlencode($t),
                array_map('strval', $texts)
            ));

        try {
            $response = Http::timeout(8)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Portfolio Translator)'])
                ->get($url.'?'.$query);

            if (! $response->ok()) {
                return [];
            }

            $body = $response->json();

            if (! is_array($body)) {
                return [];
            }

            // single string → ["translated"], multiple → ["a","b"]
            return array_map(fn ($v) => is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE), $body);
        } catch (\Throwable $e) {
            return [];
        }
    }
}
