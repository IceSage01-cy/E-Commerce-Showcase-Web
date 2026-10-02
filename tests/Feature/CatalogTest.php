<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withSession(['is_admin' => true]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Figure',
            'series' => 'Test Series',
            'price' => 1500,
            'category' => 'on-hand',
            'condition' => 'New',
            'inStock' => true,
        ], $overrides);
    }

    // ── Seeders ────────────────────────────────────────────────────────

    public function test_seeding_repeatedly_never_duplicates_anything(): void
    {
        $this->seed(DatabaseSeeder::class);
        $counts = [Product::count(), Banner::count(), \App\Models\User::count()];

        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame($counts, [Product::count(), Banner::count(), \App\Models\User::count()]);
        $this->assertGreaterThan(0, $counts[0]);
    }

    public function test_reseeding_does_not_overwrite_admin_edits(): void
    {
        $this->seed(DatabaseSeeder::class);

        $rem = Product::where('name', 'Rem Ice Flower Ver.')->firstOrFail();
        $rem->update(['in_stock' => false, 'price' => 1234]);

        $this->seed(DatabaseSeeder::class);

        $rem->refresh();
        $this->assertFalse($rem->in_stock);
        $this->assertEquals(1234, $rem->price);
    }

    public function test_database_rejects_duplicate_listings(): void
    {
        Product::factory()->create(['name' => 'A', 'series' => 'S', 'condition' => 'New']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Product::factory()->create(['name' => 'A', 'series' => 'S', 'condition' => 'New']);
    }

    // ── Public API ─────────────────────────────────────────────────────

    public function test_public_api_exposes_boolean_in_stock_and_no_quantity(): void
    {
        Product::factory()->create(['in_stock' => false]);

        $item = $this->getJson('/api/products')->assertOk()->json(0);

        $this->assertFalse($item['inStock']);
        $this->assertArrayNotHasKey('stock', $item);
    }

    // ── Admin: in/out of stock ─────────────────────────────────────────

    public function test_admin_can_toggle_stock_with_one_request(): void
    {
        $product = Product::factory()->create(['in_stock' => true]);

        $this->admin()->patchJson("/admin/api/products/{$product->id}/stock", ['inStock' => false])
            ->assertOk()
            ->assertJsonPath('inStock', false);
        $this->assertFalse($product->fresh()->in_stock);

        $this->admin()->patchJson("/admin/api/products/{$product->id}/stock", ['inStock' => true])
            ->assertOk();
        $this->assertTrue($product->fresh()->in_stock);
    }

    public function test_toggle_requires_admin_login_and_a_boolean(): void
    {
        $product = Product::factory()->create();

        // API-style calls get a real 401 (not a redirect to the login page) so the UI can't mistake it for success.
        $this->patchJson("/admin/api/products/{$product->id}/stock", ['inStock' => false])->assertUnauthorized();
        $this->get('/admin')->assertRedirect(route('admin.login'));
        $this->admin()->patchJson("/admin/api/products/{$product->id}/stock", [])->assertStatus(422);
        $this->admin()->patchJson("/admin/api/products/{$product->id}/stock", ['inStock' => 'maybe'])->assertStatus(422);
    }

    public function test_admin_can_create_and_edit_product_with_in_stock_flag(): void
    {
        $id = $this->admin()->postJson('/admin/api/products', $this->payload(['inStock' => false]))
            ->assertCreated()->assertJsonPath('inStock', false)->json('id');

        $this->admin()->putJson("/admin/api/products/{$id}", $this->payload(['inStock' => true, 'price' => 2000]))
            ->assertOk()->assertJsonPath('inStock', true);
    }

    public function test_creating_a_duplicate_listing_returns_a_friendly_validation_error(): void
    {
        $this->admin()->postJson('/admin/api/products', $this->payload())->assertCreated();

        $this->admin()->postJson('/admin/api/products', $this->payload())
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');

        // Same name + series but a different condition is a legitimately different listing.
        $this->admin()->postJson('/admin/api/products', $this->payload(['condition' => 'Pre-owned']))
            ->assertCreated();
    }

    public function test_editing_a_product_without_changing_its_name_is_not_flagged_as_duplicate(): void
    {
        $id = $this->admin()->postJson('/admin/api/products', $this->payload())->json('id');

        $this->admin()->putJson("/admin/api/products/{$id}", $this->payload(['price' => 999]))->assertOk();
    }
}
