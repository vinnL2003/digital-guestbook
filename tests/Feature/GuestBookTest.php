<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestBookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        SiteSetting::current();
    }

    public function test_welcome_page_can_be_rendered(): void
    {
        $response = $this->get(route('guest.welcome'));
        $response->assertStatus(200);
    }

    public function test_check_in_form_can_be_rendered(): void
    {
        Division::create([
            'division_name' => 'Dinas Kominfo',
            'pic_name' => 'Bpk. Hendra',
            'is_active' => true,
        ]);

        $response = $this->get(route('guest.check-in'));
        $response->assertStatus(200);
    }

    public function test_guest_can_register_with_signature(): void
    {
        $division = Division::create([
            'division_name' => 'Bagian Umum',
            'is_active' => true,
        ]);

        $sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4SURBVHgB7dKxDcIwFEXRfxo2YCMmoxfKDAgFCgtQZglGgAokUuQoInmKnq5wjnR1dd8+5/t7vN/fNf88r7f78/x5r+vn3VfXfdfYp9/63+3x/vQ1f4a9b/6c6/Z1rZ0b3uN4r/3/H/e817j19/d63c9rfL29177e0/f6r3G99y/f6z/jvf7r3/u8t2vv3v3/rv2807f3/jG/9+3f+3rf3vf6t7/3eXv93699j/f9/rfv9Z/xXv91e5/3fv8Y977e77/7vO/3f1/v9b69b+/r16/rvfa1vr1v7+vX/f/t3/3/r/3/r//t3v333v+7e/ee3937vvd+/rv3e+9//d/X3/vv/3f/37/rN87f/dfvf/v3v/t7v6/7/d/f+6/3r/7X633r/79/f15r/2/fr2vf67Xev/f/31/39/Wfvtbfftf/v/fr+vdv99/ff/dfw8g8d3R+ZzEAAAABJRU5ErkJggg==';

        $response = $this->post(route('guest.check-in.store'), [
            'visitor_name' => 'Budi Santoso',
            'institution' => 'PT Solusi Digital',
            'phone_number' => '08123456789',
            'division_id' => $division->id,
            'visitor_count' => 2,
            'purpose' => 'Rapat koordinasi teknis',
            'signature_base64' => $sampleSignature,
        ]);

        $this->assertDatabaseHas('visits', [
            'visitor_name' => 'Budi Santoso',
            'institution' => 'PT Solusi Digital',
            'status' => 'checked_in',
        ]);

        $visit = Visit::first();
        $response->assertRedirect(route('guest.ticket', $visit->ticket_code));
    }

    public function test_group_visit_saves_each_member_name_and_signature(): void
    {
        $division = Division::create([
            'division_name' => 'Bagian Protokol',
            'is_active' => true,
        ]);

        $sig1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4SURBVHgB7dKxDcIwFEXRfxo2YCMmoxfKDAgFCgtQZglGgAokUuQoInmKnq5wjnR1dd8+5/t7vN/fNf88r7f78/x5r+vn3VfXfdfYp9/63+3x/vQ1f4a9b/6c6/Z1rZ0b3uN4r/3/H/e817j19/d63c9rfL29177e0/f6r3G99y/f6z/jvf7r3/u8t2vv3v3/rv2807f3/jG/9+3f+3rf3vf6t7/3eXv93699j/f9/rfv9Z/xXv91e5/3fv8Y977e77/7vO/3f1/v9b69b+/r16/rvfa1vr1v7+vX/f/t3/3/r/3/r//t3v333v+7e/ee3937vvd+/rv3e+9//d/X3/vv/3f/37/rN87f/dfvf/v3v/t7v6/7/d/f+6/3r/7X633r/79/f15r/2/fr2vf67Xev/f/31/39/Wfvtbfftf/v/fr+vdv99/ff/dfw8g8d3R+ZzEAAAABJRU5ErkJggg==';
        $sig2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4SURBVHgB7dKxDcIwFEXRfxo2YCMmoxfKDAgFCgtQZglGgAokUuQoInmKnq5wjnR1dd8+5/t7vN/fNf88r7f78/x5r+vn3VfXfdfYp9/63+3x/vQ1f4a9b/6c6/Z1rZ0b3uN4r/3/H/e817j19/d63c9rfL29177e0/f6r3G99y/f6z/jvf7r3/u8t2vv3v3/rv2807f3/jG/9+3f+3rf3vf6t7/3eXv93699j/f9/rfv9Z/xXv91e5/3fv8Y977e77/7vO/3f1/v9b69b+/r16/rvfa1vr1v7+vX/f/t3/3/r/3/r//t3v333v+7e/ee3937vvd+/rv3e+9//d/X3/vv/3f/37/rN87f/dfvf/v3v/t7v6/7/d/f+6/3r/7X633r/79/f15r/2/fr2vf67Xev/f/31/39/Wfvtbfftf/v/fr+vdv99/ff/dfw8g8d3R+ZzEAAAABJRU5ErkJggg==';

        $response = $this->post(route('guest.check-in.store'), [
            'visitor_name' => 'Ahmad Fauzi',
            'institution' => 'Kementerian Keuangan',
            'phone_number' => '082199887766',
            'division_id' => $division->id,
            'visitor_count' => 2,
            'purpose' => 'Konsultasi e-Budgeting',
            'signature_base64' => $sig1,
            'members' => [
                ['name' => 'Ahmad Fauzi', 'signature_base64' => $sig1],
                ['name' => 'Rina Sasmita', 'signature_base64' => $sig2],
            ],
        ]);

        $this->assertDatabaseHas('visits', [
            'visitor_name' => 'Ahmad Fauzi',
            'visitor_count' => 2,
        ]);

        $this->assertDatabaseHas('visit_members', [
            'name' => 'Ahmad Fauzi',
            'is_leader' => true,
        ]);

        $this->assertDatabaseHas('visit_members', [
            'name' => 'Rina Sasmita',
            'is_leader' => false,
        ]);

        $visit = Visit::first();
        $this->assertCount(2, $visit->members);
    }

    public function test_guest_can_register_with_other_custom_person_division(): void
    {
        $division = Division::create([
            'division_name' => 'Lainnya: (Menemui Seseorang / Isi Sendiri)',
            'pic_name' => 'Sesuai Nama yang Dituju',
            'is_active' => true,
        ]);

        $sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4SURBVHgB7dKxDcIwFEXRfxo2YCMmoxfKDAgFCgtQZglGgAokUuQoInmKnq5wjnR1dd8+5/t7vN/fNf88r7f78/x5r+vn3VfXfdfYp9/63+3x/vQ1f4a9b/6c6/Z1rZ0b3uN4r/3/H/e817j19/d63c9rfL29177e0/f6r3G99y/f6z/jvf7r3/u8t2vv3v3/rv2807f3/jG/9+3f+3rf3vf6t7/3eXv93699j/f9/rfv9Z/xXv91e5/3fv8Y977e77/7vO/3f1/v9b69b+/r16/rvfa1vr1v7+vX/f/t3/3/r/3/r//t3v333v+7e/ee3937vvd+/rv3e+9//d/X3/vv/3f/37/rN87f/dfvf/v3v/t7v6/7/d/f+6/3r/7X633r/79/f15r/2/fr2vf67Xev/f/31/39/Wfvtbfftf/v/fr+vdv99/ff/dfw8g8d3R+ZzEAAAABJRU5ErkJggg==';

        $response = $this->post(route('guest.check-in.store'), [
            'visitor_name' => 'Ricky Tangkuman',
            'institution' => 'Mitra Mandiri',
            'phone_number' => '081122334455',
            'division_id' => $division->id,
            'destination_person' => 'Bpk. Hendra Wowor (Staff Operasi)',
            'visitor_count' => 1,
            'purpose' => 'Menyerahkan dokumen perbaikan trafo',
            'signature_base64' => $sampleSignature,
        ]);

        $this->assertDatabaseHas('visits', [
            'visitor_name' => 'Ricky Tangkuman',
            'destination_person' => 'Bpk. Hendra Wowor (Staff Operasi)',
            'division_id' => $division->id,
        ]);

        $visit = Visit::where('visitor_name', 'Ricky Tangkuman')->first();
        $response->assertRedirect(route('guest.ticket', $visit->ticket_code));
    }

    public function test_guest_cannot_submit_without_signature(): void
    {
        $division = Division::create([
            'division_name' => 'Bagian Umum',
            'is_active' => true,
        ]);

        $response = $this->post(route('guest.check-in.store'), [
            'visitor_name' => 'Budi Santoso',
            'institution' => 'PT Solusi Digital',
            'phone_number' => '08123456789',
            'division_id' => $division->id,
            'visitor_count' => 1,
            'purpose' => 'Konsultasi',
            'signature_base64' => '',
        ]);

        $response->assertSessionHasErrors('signature_base64');
        $this->assertDatabaseCount('visits', 0);
    }

    public function test_operator_can_check_out_visitor(): void
    {
        $operator = User::create([
            'name' => 'Resepsionis',
            'email' => 'operator@test.com',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'is_active' => true,
        ]);

        $division = Division::create([
            'division_name' => 'Bagian Umum',
            'is_active' => true,
        ]);

        $visit = Visit::create([
            'ticket_code' => 'VST-TEST01',
            'visitor_name' => 'Dewi Anggraeni',
            'institution' => 'Dinas Pendidikan',
            'phone_number' => '0899999999',
            'division_id' => $division->id,
            'visitor_count' => 1,
            'purpose' => 'Kunjungan kerja',
            'signature_base64' => 'data:image/png;base64,demo',
            'status' => 'checked_in',
            'check_in_time' => now(),
        ]);

        $response = $this->actingAs($operator)->post(route('visits.checkout', $visit->id));

        $visit->refresh();
        $this->assertEquals('checked_out', $visit->status);
        $this->assertNotNull($visit->check_out_time);
        $this->assertEquals($operator->id, $visit->checked_out_by);
    }

    public function test_dashboard_sanitizes_date_filter_bounds(): void
    {
        $operator = User::create([
            'name' => 'Operator',
            'email' => 'operator2@test.com',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'is_active' => true,
        ]);

        // Year below 2026 should be sanitized to default
        $response = $this->actingAs($operator)->get(route('dashboard', ['date' => '2024-05-10']));
        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->where('filters.date', fn ($date) => (int)explode('-', $date)[0] >= 2026)
        );

        // 5-digit year should be sanitized to default
        $response5Digit = $this->actingAs($operator)->get(route('dashboard', ['date' => '20260-01-01']));
        $response5Digit->assertOk();
        $response5Digit->assertInertia(fn ($page) => 
            $page->where('filters.date', fn ($date) => strlen(explode('-', $date)[0]) === 4)
        );
    }

    public function test_operator_can_view_qr_poster_page(): void
    {
        $operator = User::create([
            'name' => 'Operator',
            'email' => 'operator_poster@test.com',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'is_active' => true,
        ]);

        $response = $this->actingAs($operator)->get(route('admin.qr-poster'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Admin/QrPoster'));
    }

    public function test_guest_can_view_checkout_page(): void
    {
        $response = $this->get(route('guest.check-out'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Guest/CheckOut'));
    }

    public function test_guest_can_lookup_ticket_and_self_checkout(): void
    {
        $division = Division::create([
            'division_name' => 'K3L & Keamanan',
            'is_active' => true,
        ]);

        $visit = Visit::create([
            'ticket_code' => 'PLN-TEST-1234',
            'visitor_name' => 'Ferry Sompie',
            'institution' => 'Mitra Vendor PLN',
            'phone_number' => '081234567890',
            'division_id' => $division->id,
            'visitor_count' => 1,
            'purpose' => 'Maintenance Jaringan',
            'signature_base64' => 'data:image/png;base64,fake-sig',
            'check_in_time' => now()->subHours(2),
            'status' => 'checked_in',
        ]);

        // Lookup with ticket code in query string
        $lookupResponse = $this->get(route('guest.check-out', ['ticket' => $visit->ticket_code]));
        $lookupResponse->assertOk();
        $lookupResponse->assertInertia(fn ($page) => 
            $page->component('Guest/CheckOut')
                 ->has('visit')
                 ->where('visit.ticket_code', 'PLN-TEST-1234')
        );

        // Process self check-out
        $checkOutResponse = $this->post(route('guest.check-out.process'), [
            'ticket_code' => $visit->ticket_code,
        ]);

        $checkOutResponse->assertRedirect(route('guest.ticket', $visit->ticket_code));

        $visit->refresh();
        $this->assertEquals('checked_out', $visit->status);
        $this->assertNotNull($visit->check_out_time);
    }

    public function test_authenticated_user_can_fetch_sync_status(): void
    {
        $operator = User::create([
            'name' => 'Operator Pos',
            'email' => 'operator_sync@test.com',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'is_active' => true,
        ]);

        $response = $this->actingAs($operator)->get(route('admin.sync-status'));
        $response->assertOk();
        $response->assertJsonStructure([
            'fingerprint',
            'last_updated',
            'active_now',
            'checked_out_today',
            'total_count',
        ]);
    }

    public function test_admin_can_update_security_induction_settings(): void
    {
        $admin = User::create([
            'name' => 'Admin K3',
            'email' => 'admin_k3@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.settings.update'), [
            'security_induction_title' => 'Induksi Keselamatan Kerja PT PLN UPT Manado',
            'security_induction_content' => 'Aturan zonasi khusus Gardu Induk & Saluran Transmisi.',
            'is_security_induction_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('site_settings', [
            'security_induction_title' => 'Induksi Keselamatan Kerja PT PLN UPT Manado',
            'is_security_induction_active' => 1,
        ]);
    }

    public function test_admin_can_reset_security_induction_to_default(): void
    {
        $admin = User::create([
            'name' => 'Admin K3 Reset',
            'email' => 'admin_k3_reset@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $setting = SiteSetting::current();
        $setting->update([
            'security_induction_title' => 'Judul Berubah',
            'security_induction_content' => 'Konten berubah',
            'is_security_induction_active' => false,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.settings.reset-induction'));
        $response->assertRedirect();

        $setting->refresh();
        $this->assertEquals('Security Induction PT PLN (Persero) UPT Manado', $setting->security_induction_title);
        $this->assertTrue($setting->is_security_induction_active);
        $this->assertStringContainsString('ZONA TERTUTUP (MERAH)', $setting->security_induction_content);
    }

    public function test_check_in_page_shares_security_induction(): void
    {
        $response = $this->get(route('guest.check-in'));
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Guest/CheckIn')
                 ->has('setting.security_induction_title')
                 ->has('setting.security_induction_content')
                 ->has('setting.is_security_induction_active')
        );
    }
}
