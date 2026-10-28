<?php

namespace Tests\Feature;

use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    private function banner(array $overrides = []): Banner
    {
        return Banner::create(array_merge([
            'title' => 'New Drops',
            'subtitle' => 'Fresh stock',
            'cta_label' => 'Shop',
            'cta_action' => 'new-arrivals',
            'image_url' => 'https://example.com/one.jpg',
            'accent' => '#FF2D78',
            'sort_order' => 1,
            'is_active' => true,
        ], $overrides));
    }

    public function test_home_page_embeds_active_banners_and_preloads_the_first_photo(): void
    {
        $this->banner(['title' => 'Second', 'image_url' => 'https://example.com/two.jpg', 'sort_order' => 2]);
        $this->banner(['title' => 'First', 'image_url' => 'https://example.com/one.jpg', 'sort_order' => 1]);
        $this->banner(['title' => 'Hidden', 'image_url' => 'https://example.com/hidden.jpg', 'is_active' => false]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('<link rel="preload" as="image" href="https://example.com/one.jpg" fetchpriority="high">', false);
        $response->assertSee('id="initial-banners"', false);
        $response->assertSeeInOrder(['First', 'Second'], false);
        $response->assertDontSee('Hidden');
        $response->assertDontSee('hidden.jpg');
    }

    public function test_embedded_banner_text_cannot_break_out_of_the_page(): void
    {
        $this->banner(['title' => '</script><script>alert(1)</script>']);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('</script><script>alert(1)', false);
    }

    public function test_home_page_still_renders_without_banners(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('initial-banners', false);
        $response->assertDontSee('rel="preload" as="image"', false);
    }

    public function test_banner_api_matches_what_the_page_embeds(): void
    {
        $this->banner();

        $this->getJson('/api/banners')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'New Drops')
            ->assertJsonPath('0.image', 'https://example.com/one.jpg');
    }
}
