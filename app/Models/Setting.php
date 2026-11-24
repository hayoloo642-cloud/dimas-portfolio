<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::query()->find($key);

        return $row ? $row->value : $default;
    }

    public static function put(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => is_scalar($value) ? (string) $value : json_encode($value)]);
    }

    public static function flag(string $key, bool $default = false): bool
    {
        $v = static::get($key);

        return $v === null ? $default : $v === '1';
    }
}
