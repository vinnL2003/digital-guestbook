<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'name',
        'signature_base64',
        'is_leader',
    ];

    protected function casts(): array
    {
        return [
            'is_leader' => 'boolean',
        ];
    }

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }
}
