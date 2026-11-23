<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_code',
        'visitor_name',
        'institution',
        'phone_number',
        'division_id',
        'destination_person',
        'visitor_count',
        'purpose',
        'signature_base64',
        'status',
        'check_in_time',
        'slot_time',
        'check_out_time',
        'checked_out_by',
    ];

    protected function casts(): array
    {
        return [
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'visitor_count' => 'integer',
        ];
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function members()
    {
        return $this->hasMany(VisitMember::class)->orderBy('is_leader', 'desc')->orderBy('id', 'asc');
    }

    public function checkedOutByUser()
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    public static function generateTicketCode(): string
    {
        do {
            $code = 'VST-' . strtoupper(substr(uniqid(), -6));
        } while (self::where('ticket_code', $code)->exists());

        return $code;
    }
}
