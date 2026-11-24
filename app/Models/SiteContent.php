<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $guarded = [];

    protected $casts = [
        'data' => 'array',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], ['data' => []]);
    }
}
