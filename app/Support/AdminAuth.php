<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Lightweight admin auth for the JSON API.
 *
 * - password is stored as a bcrypt hash in the settings table
 * - a signed token (HMAC of a random secret) is returned on login and sent
 *   back by the front-end as the `x-admin-token` header
 *
 * This mirrors the original zero-dependency server so the bundled admin
 * front-end keeps working untouched.
 */
class AdminAuth
{
    public function ensureSeeded(): void
    {
        if (! Setting::get('admin_hash')) {
            Setting::put('admin_hash', Hash::make((string) config('portfolio.default_password')));
        }

        if (! Setting::get('admin_secret')) {
            Setting::put('admin_secret', Str::random(48));
        }

        if (Setting::get('open_edit') === null) {
            Setting::put('open_edit', '0');
        }

        if (Setting::get('password_changed_at') === null) {
            Setting::put('password_changed_at', (string) time());
        }
    }

    public function check(string $password): bool
    {
        $hash = Setting::get('admin_hash');

        return $hash ? Hash::check($password, $hash) : false;
    }

    public function changePassword(string $password): void
    {
        Setting::put('admin_hash', Hash::make($password));
        Setting::put('password_changed_at', (string) time());
        Setting::put('admin_secret', Str::random(48));
    }

    public function token(): string
    {
        $secret = Setting::get('admin_secret') ?: '';

        return hash_hmac('sha256', 'admin-session', $secret);
    }

    public function isAdmin(?string $token): bool
    {
        if (! $token) {
            return false;
        }

        return hash_equals($this->token(), $token);
    }

    public function openEdit(): bool
    {
        return Setting::flag('open_edit', false);
    }

    public function canEdit(?string $token): bool
    {
        return $this->isAdmin($token) || $this->openEdit();
    }
}
