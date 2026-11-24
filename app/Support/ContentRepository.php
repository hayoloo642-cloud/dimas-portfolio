<?php

namespace App\Support;

use App\Models\ContentRevision;
use App\Models\SiteContent;

/**
 * Single source of truth for the editable site content.
 *
 * The whole content document lives in one JSON column (site_contents.data).
 * Every save also pushes a revision row so edits can be restored later.
 */
class ContentRepository
{
    /** Full content document merged over the shipped defaults. */
    public function all(): array
    {
        $defaults = $this->defaults();
        $stored = SiteContent::current()->data ?: [];

        return $this->merge($defaults, $stored);
    }

    /** Raw defaults shipped with the app (resources/content/defaults.json). */
    public function defaults(): array
    {
        $path = resource_path('content/defaults.json');

        if (! is_file($path)) {
            return [];
        }

        return json_decode((string) file_get_contents($path), true) ?: [];
    }

    public function save(array $data): array
    {
        $data['updatedAt'] = (int) (microtime(true) * 1000);

        $row = SiteContent::current();
        $row->data = $data;
        $row->save();

        ContentRevision::query()->create(['data' => $data]);
        $this->pruneRevisions();

        return $data;
    }

    protected function pruneRevisions(): void
    {
        $keep = (int) config('portfolio.revisions', 20);
        $ids = ContentRevision::query()->latest('id')->limit($keep)->pluck('id');

        if ($ids->isNotEmpty()) {
            ContentRevision::query()->whereNotIn('id', $ids)->delete();
        }
    }

    /** Deep merge where the stored document wins but missing keys fall back. */
    protected function merge(array $defaults, array $stored): array
    {
        if (array_is_list($defaults)) {
            return is_array($stored) ? $stored : $defaults;
        }

        $out = $defaults;

        foreach ($stored as $key => $value) {
            $out[$key] = array_key_exists($key, $defaults) && is_array($defaults[$key]) && is_array($value)
                ? $this->merge($defaults[$key], $value)
                : $value;
        }

        return $out;
    }
}
