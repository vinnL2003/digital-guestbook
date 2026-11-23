<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin and Operator Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@bukutamu.com'],
            [
                'name' => 'Administrator Utama',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $operator = User::firstOrCreate(
            ['email' => 'operator@bukutamu.com'],
            [
                'name' => 'Resepsionis Lobi',
                'password' => Hash::make('password'),
                'role' => 'operator',
                'is_active' => true,
            ]
        );

        // 2. Divisions PT PLN (Persero) UPT Manado
        $divisions = [
            [
                'division_name' => 'Bagian Operasi & Pemeliharaan Sistem Transmisi',
                'pic_name' => 'Bpk. Royke Rumengan',
                'room_location' => 'Lantai 2, Ruang O&P Transmisi',
                'is_active' => true,
            ],
            [
                'division_name' => 'Bagian Konstruksi & Jaringan Transmisi',
                'pic_name' => 'Bpk. Christian Wowor',
                'room_location' => 'Lantai 2, Ruang Konstruksi',
                'is_active' => true,
            ],
            [
                'division_name' => 'Bagian PDKB (Pekerjaan Dalam Keadaan Bertegangan)',
                'pic_name' => 'Bpk. Franky Kalalo',
                'room_location' => 'Gedung Workshop PDKB',
                'is_active' => true,
            ],
            [
                'division_name' => 'Bagian K3L & Keamanan (Keselamatan, Kesehatan Kerja & Lingkungan)',
                'pic_name' => 'Ibu Meiske Pongoh',
                'room_location' => 'Lantai 1, Ruang K3L & Kam',
                'is_active' => true,
            ],
            [
                'division_name' => 'Bagian Keuangan, Komunikasi & Umum',
                'pic_name' => 'Ibu Grace Sumual',
                'room_location' => 'Lantai 1, Sayap Timur',
                'is_active' => true,
            ],
            [
                'division_name' => 'Bagian Perencanaan & Evaluasi Sistem',
                'pic_name' => 'Bpk. David Rondonuwu',
                'room_location' => 'Lantai 2, Ruang Rendalev',
                'is_active' => true,
            ],
            [
                'division_name' => 'Ruang Manajer UPT Manado',
                'pic_name' => 'Manajer UPT Manado',
                'room_location' => 'Lantai 2, Ruang Eksekutif',
                'is_active' => true,
            ],
            [
                'division_name' => 'Lainnya: (Menemui Seseorang / Isi Sendiri)',
                'pic_name' => 'Sesuai Nama yang Dituju',
                'room_location' => 'Area Kantor UPT Manado',
                'is_active' => true,
            ],
        ];

        foreach ($divisions as $divData) {
            Division::firstOrCreate(
                ['division_name' => $divData['division_name']],
                $divData
            );
        }

        // 3. Site Settings
        SiteSetting::current();

        // 4. Sample Visits
        $sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4SURBVHgB7dKxDcIwFEXRfxo2YCMmoxfKDAgFCgtQZglGgAokUuQoInmKnq5wjnR1dd8+5/t7vN/fNf88r7f78/x5r+vn3VfXfdfYp9/63+3x/vQ1f4a9b/6c6/Z1rZ0b3uN4r/3/H/e817j19/d63c9rfL29177e0/f6r3G99y/f6z/jvf7r3/u8t2vv3v3/rv2807f3/jG/9+3f+3rf3vf6t7/3eXv93699j/f9/rfv9Z/xXv91e5/3fv8Y977e77/7vO/3f1/v9b69b+/r16/rvfa1vr1v7+vX/f/t3/3/r/3/r//t3v333v+7e/ee3937vvd+/rv3e+9//d/X3/vv/3f/37/rN87f/dfvf/v3v/t7v6/7/d/f+6/3r/7X633r/79/f15r/2/fr2vf67Xev/f/31/39/Wfvtbfftf/v/fr+vdv99/ff/dfw8g8d3R+ZzEAAAABJRU5ErkJggg==';

        $firstDivision = Division::first();

        Visit::firstOrCreate(
            ['ticket_code' => 'VST-849201'],
            [
                'visitor_name' => 'Ahmad Fauzi',
                'institution' => 'PT Solusi Teknologi Nusantara',
                'phone_number' => '081234567890',
                'division_id' => $firstDivision ? $firstDivision->id : 1,
                'visitor_count' => 2,
                'purpose' => 'Koordinasi teknis integrasi sistem server dan jaringan.',
                'signature_base64' => $sampleSignature,
                'status' => 'checked_in',
                'check_in_time' => Carbon::now()->subHours(2),
            ]
        );

        Visit::firstOrCreate(
            ['ticket_code' => 'VST-192842'],
            [
                'visitor_name' => 'Siti Nurhaliza',
                'institution' => 'Universitas Indonesia',
                'phone_number' => '085678901234',
                'division_id' => $firstDivision ? $firstDivision->id : 1,
                'visitor_count' => 1,
                'purpose' => 'Pengajuan surat permohonan data penelitian magang.',
                'signature_base64' => $sampleSignature,
                'status' => 'checked_out',
                'check_in_time' => Carbon::now()->subHours(4),
                'check_out_time' => Carbon::now()->subHours(1),
                'checked_out_by' => $operator->id,
            ]
        );
    }
}
