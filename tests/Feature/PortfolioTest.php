<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Support\AdminAuth;
use App\Support\ContentRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AdminAuth::class)->ensureSeeded();
    }

    public function test_home_page_renders_the_public_site(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('DIMAS', false)
            ->assertSee('Buka menu');
    }

    public function test_hidden_admin_path_renders_the_panel(): void
    {
        $this->get('/'.config('portfolio.admin_path'))
            ->assertOk()
            ->assertSee('login__card', false);
    }

    public function test_api_returns_content_seeded_from_defaults(): void
    {
        $this->getJson('/api/content')
            ->assertOk()
            ->assertJsonPath('profile.firstName', 'Dimas')
            ->assertJsonPath('profile.lastName', 'Parama');
    }

    public function test_open_edit_is_off_by_default(): void
    {
        $this->getJson('/api/meta')
            ->assertOk()
            ->assertJsonPath('openEdit', false)
            ->assertJsonPath('canEdit', false)
            ->assertJsonPath('authed', false);
    }

    public function test_content_cannot_be_saved_without_authentication(): void
    {
        $this->putJson('/api/content', ['profile' => ['firstName' => 'Hacker']])
            ->assertStatus(401);
    }

    public function test_admin_can_login_and_save_content(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])
            ->assertOk()
            ->json('token');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', ['profile' => ['firstName' => 'Dimas', 'lastName' => 'Baru']])
            ->assertOk();

        $this->getJson('/api/content')
            ->assertJsonPath('profile.lastName', 'Baru');
    }

    public function test_wrong_password_is_rejected(): void
    {
        $this->postJson('/api/login', ['password' => 'salah'])
            ->assertStatus(401);
    }

    public function test_admin_can_toggle_public_editing(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->postJson('/api/settings', ['openEdit' => true])
            ->assertOk()
            ->assertJsonPath('openEdit', true);

        $this->getJson('/api/meta')->assertJsonPath('canEdit', true);
    }

    public function test_upload_stores_a_media_row(): void
    {
        Storage::fake('public');
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        // 1x1 transparent png
        $png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AL+2ZsAAAAASUVORK5CYII=';

        $url = $this->withHeader('x-admin-token', $token)
            ->postJson('/api/upload', ['dataUrl' => $png])
            ->assertOk()
            ->json('url');

        $this->assertStringStartsWith('/storage/uploads/', $url);
        $this->assertDatabaseCount('media', 1);
        Storage::disk('public')->assertExists('uploads/'.basename($url));
    }

    public function test_saving_content_creates_a_revision(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', app(ContentRepository::class)->defaults())
            ->assertOk();

        $this->assertDatabaseCount('content_revisions', 1);
    }

    public function test_password_can_be_changed_and_persists(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->postJson('/api/settings', ['newPassword' => 'rahasia123'])
            ->assertOk();

        $this->postJson('/api/login', ['password' => 'admin123'])->assertStatus(401);
        $this->postJson('/api/login', ['password' => 'rahasia123'])->assertOk();
    }

    public function test_defaults_are_never_overwritten_by_partial_saves(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', ['hero' => ['greeting' => 'Halo!']])
            ->assertOk();

        $this->getJson('/api/content')
            ->assertJsonPath('hero.greeting', 'Halo!')
            ->assertJsonPath('profile.firstName', 'Dimas');
    }

    public function test_indo_and_english_documents_are_served(): void
    {
        $this->getJson('/api/content')->assertJsonPath('nav.certificate', 'Sertifikat');

        \Illuminate\Support\Facades\Http::fake([
            'translate.googleapis.com/*' => \Illuminate\Support\Facades\Http::response(
                ['Aku adalah seorang anak', 'Certificates', 'Proof'],
                200
            ),
        ]);

        $this->getJson('/api/content/translated?locale=en')
            ->assertOk()
            ->assertJsonPath('bio.title', 'Short history');

        // second request must be served from the local cache
        $this->getJson('/api/content/translated?locale=en')->assertOk();
        $this->assertGreaterThanOrEqual(3, \App\Models\Translation::query()->count());
    }

    public function test_new_admin_text_is_translated_on_demand(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'translate.googleapis.com/*' => \Illuminate\Support\Facades\Http::response(['Brand new sentence'], 200),
        ]);

        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', ['bio' => ['title' => 'Judul yang baru sekali']])
            ->assertOk();

        $this->getJson('/api/content/translated?locale=en')
            ->assertOk()
            ->assertJsonPath('bio.title', 'Brand new sentence');
    }

    public function test_visitor_counter_counts_unique_visitors(): void
    {
        $this->postJson('/api/visit', ['token' => 'visitor-a'])
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('returning', false);

        // same visitor again → not counted twice
        $this->postJson('/api/visit', ['token' => 'visitor-a'])
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('returning', true);

        $this->postJson('/api/visit', ['token' => 'visitor-b'])
            ->assertOk()
            ->assertJsonPath('count', 2);
    }

    public function test_github_proxy_rejects_invalid_usernames(): void
    {
        $this->getJson('/api/github/not valid user!!')->assertNotFound();
    }

    public function test_github_proxy_returns_repositories(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'api.github.com/users/dimasparama' => \Illuminate\Support\Facades\Http::response([
                'login' => 'dimasparama',
                'name' => 'Dimas Parama',
                'public_repos' => 3,
                'followers' => 7,
                'html_url' => 'https://github.com/dimasparama',
            ], 200),
            'api.github.com/users/dimasparama/repos*' => \Illuminate\Support\Facades\Http::response([
                ['name' => 'portfolio', 'html_url' => 'https://github.com/dimasparama/portfolio', 'description' => 'Situs portofolio', 'language' => 'JavaScript', 'stargazers_count' => 4, 'updated_at' => '2026-01-01', 'fork' => false],
                ['name' => 'forked', 'html_url' => 'https://github.com/x/forked', 'fork' => true],
            ], 200),
        ]);

        $this->getJson('/api/github/dimasparama')
            ->assertOk()
            ->assertJsonPath('user', 'dimasparama')
            ->assertJsonPath('publicRepos', 3)
            ->assertJsonPath('repos.0.name', 'portfolio')
            ->assertJsonCount(1, 'repos');
    }

    public function test_admin_panel_exposes_the_new_tabs(): void
    {
        $this->get('/'.config('portfolio.admin_path'))
            ->assertOk()
            ->assertSee('panelBody', false);

        $page = $this->get('/');
        $page->assertSee('id="certificate"', false);
        $page->assertSee('id="skills"', false);
        $page->assertSee('id="themeToggle"', false);
        $page->assertSee('id="langToggle"', false);
        $page->assertSee('id="visitCount"', false);
        $page->assertSee('id="projectList"', false);
        $page->assertSee('id="projectDetail"', false);
        $page->assertSee('id="footerWordmarkTrack"', false);
        $page->assertSee('hero__edge', false);
    }

    public function test_projects_are_part_of_the_content_document(): void
    {
        $this->getJson('/api/content')
            ->assertOk()
            ->assertJsonPath('projects.heading', 'Project')
            ->assertJsonStructure([
                'projects' => [
                    'label', 'heading', 'script', 'sub', 'note',
                    'items' => [
                        ['no', 'title', 'desc', 'detail', 'cover', 'year', 'role', 'link', 'docs'],
                    ],
                ],
            ]);
    }

    public function test_projects_can_be_added_and_removed_from_the_admin_api(): void
    {
        $token = $this->postJson('/api/login', ['password' => 'admin123'])->json('token');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', [
                'projects' => [
                    'items' => [
                        ['no' => 'NO. 01', 'title' => 'Satu', 'desc' => '', 'detail' => '', 'cover' => '', 'year' => '', 'role' => '', 'link' => '', 'docs' => ['a.webp', 'b.webp']],
                        ['no' => 'NO. 02', 'title' => 'Dua', 'desc' => '', 'detail' => '', 'cover' => '', 'year' => '', 'role' => '', 'link' => '', 'docs' => []],
                    ],
                ],
            ])
            ->assertOk();

        $this->getJson('/api/content')
            ->assertJsonCount(2, 'projects.items')
            ->assertJsonCount(2, 'projects.items.0.docs');

        $this->withHeader('x-admin-token', $token)
            ->putJson('/api/content', ['projects' => ['items' => [
                ['no' => 'NO. 01', 'title' => 'Satu', 'desc' => '', 'detail' => '', 'cover' => '', 'year' => '', 'role' => '', 'link' => '', 'docs' => ['a.webp']],
            ]]])
            ->assertOk();

        $this->getJson('/api/content')
            ->assertJsonCount(1, 'projects.items')
            ->assertJsonCount(1, 'projects.items.0.docs');
    }
}
