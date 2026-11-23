<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_name',
        'welcome_title',
        'welcome_subtitle',
        'logo_url',
        'announcement_text',
        'security_induction_title',
        'security_induction_content',
        'is_security_induction_active',
    ];

    protected function casts(): array
    {
        return [
            'is_security_induction_active' => 'boolean',
        ];
    }

    public static function defaultSecurityInductionContent(): string
    {
        return "Sesuai dengan penerapan Sistem Manajemen Pengamanan (SMP) di wilayah kerja PT PLN (Persero) Unit Pelaksana Transmisi Manado, maka setiap tamu dipersyaratkan memahami dan melaksanakan peraturan keamanan yang dibuat sebagai berikut:\n\n"
            . "1. ZONA TERTUTUP (MERAH)\n"
            . "Daerah/lokasi tertentu yang dinilai sangat vital berdasarkan penilaian risiko sangat tinggi dan ekstrem, apabila terjadi gangguan akan/dapat mengakibatkan terhentinya aktifitas perusahaan kecuali mereka yang karena tugas dan jabatannya harus berada didalam dan orang-orang tertentu yang telah mendapatkan ijin kerja berdasarkan lokasi dan jenis pekerjaan melalui surat ijin kerja (Working Permit) dari pimpinan atau pejabat berwenang.\n"
            . "• Penandaan/Pembatasan:\n"
            . "  - Zona ditandai dengan warna merah\n"
            . "  - Diberikan rambu zona tertutup\n"
            . "  - Kartu visitor/pengunjung berwarna merah\n"
            . "  - Area dilengkapi dengan akses kontrol\n"
            . "• Pemberlakuan:\n"
            . "  - Masuk zona wajib memperoleh akses khusus atau izin dari pejabat terkait dan/atau penanggung jawab area.\n\n"
            . "2. ZONA TERLARANG (KUNING)\n"
            . "Daerah/lokasi tertentu yang dinilai lebih vital berdasarkan penilaian risiko tinggi dengan ketentuan bahwa apabila terjadi gangguan akan/dapat mengakibatkan timbulnya gangguan terhadap aktivitas instalasi serta mempengaruhi aktivitas organisasi kecuali mereka yang telah mendapatkan ijin kerja berdasarkan lokasi dan jenis pekerjaan melalui surat ijin kerja (Working Permit) dari pimpinan atau pejabat berwenang.\n"
            . "• Penandaan/Pembatasan:\n"
            . "  - Zona ditandai dengan warna kuning\n"
            . "  - Diberikan rambu zona terlarang\n"
            . "  - Kartu visitor/pengunjung berwarna kuning\n"
            . "• Pemberlakuan:\n"
            . "  - Masuk zona wajib memperoleh izin dari penanggung jawab area.\n\n"
            . "3. ZONA TERBATAS (BIRU)\n"
            . "Daerah/lokasi tertentu yang dinilai tidak terlalu vital berdasarkan penilaian risiko moderat dengan ketentuan bahwa apabila terjadi suatu gangguan tidak mengakibatkan hambatan atau terhentinya aktivitas instalasi tersebut.\n"
            . "• Penandaan/Pembatasan:\n"
            . "  - Zona ditandai dengan warna biru\n"
            . "  - Diberikan rambu zona terbatas\n"
            . "  - Kartu visitor/pengunjung berwarna biru\n"
            . "• Pemberlakuan:\n"
            . "  - Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.\n\n"
            . "4. ZONA BEBAS TERBATAS (HIJAU)\n"
            . "Merupakan daerah/lokasi tertentu yang dinilai tidak vital berdasarkan penilaian risiko rendah.\n"
            . "• Penandaan/Pembatasan:\n"
            . "  - Zona ditandai dengan warna hijau\n"
            . "  - Diberikan rambu zona bebas terbatas\n"
            . "  - Kartu visitor/pengunjung berwarna hijau\n"
            . "• Pemberlakuan:\n"
            . "  - Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.\n\n"
            . "Peraturan ini akan selalu ditinjau dan diubah sewaktu-waktu sesuai perkembangan yang ada.";
    }

    public static function current(): self
    {
        $setting = self::firstOrCreate(
            ['id' => 1],
            [
                'organization_name' => 'PT PLN (Persero) UPT Manado',
                'welcome_title' => 'Buku Tamu Digital PT PLN (Persero) UPT Manado',
                'welcome_subtitle' => 'Selamat datang di Kantor PT PLN (Persero) Unit Pelaksana Transmisi Manado. Silakan lakukan pencatatan kehadiran kunjungan Anda.',
                'logo_url' => '/images/Logo_PLN.png',
                'announcement_text' => null,
                'security_induction_title' => 'Security Induction PT PLN (Persero) UPT Manado',
                'security_induction_content' => self::defaultSecurityInductionContent(),
                'is_security_induction_active' => true,
            ]
        );

        if (empty($setting->security_induction_content)) {
            $setting->update([
                'security_induction_title' => $setting->security_induction_title ?: 'Security Induction PT PLN (Persero) UPT Manado',
                'security_induction_content' => self::defaultSecurityInductionContent(),
                'is_security_induction_active' => $setting->is_security_induction_active ?? true,
            ]);
        }

        return $setting;
    }
}
