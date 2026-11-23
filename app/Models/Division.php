<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_name',
        'pic_name',
        'room_location',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
