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
            'collection' => 'anime-figures',
            'condition' => 'MIB',
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
        Product::factory()->create(['name' => 'A', 'series' => 'S', 'condition' => 'MIB']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Product::factory()->create(['name' => 'A', 'series' => 'S', 'condition' => 'MIB']);
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
        $this->admin()->postJson('/admin/api/products', $this->payload(['condition' => 'LOOSE']))
            ->assertCreated();
    }

    public function test_editing_a_product_without_changing_its_name_is_not_flagged_as_duplicate(): void
    {
        $id = $this->admin()->postJson('/admin/api/products', $this->payload())->json('id');

        $this->admin()->putJson("/admin/api/products/{$id}", $this->payload(['price' => 999]))->assertOk();
    }

    // ── Conditions, categories, ordering, bulk edits ────────────────────────

    public function test_condition_must_be_misb_mib_bib_or_loose(): void
    {
        foreach (['MISB', 'MIB', 'BIB', 'LOOSE'] as $i => $condition) {
            $this->admin()->postJson('/admin/api/products', $this->payload(['name' => "Fig $i", 'condition' => $condition]))
                ->assertCreated()->assertJsonPath('condition', $condition);
        }

        foreach (['New', 'Sealed', 'Pre-owned', 'misb'] as $bad) {
            $this->admin()->postJson('/admin/api/products', $this->payload(['name' => "Bad $bad", 'condition' => $bad]))
                ->assertStatus(422)->assertJsonValidationErrors('condition');
        }
    }

    public function test_product_collection_is_validated_and_exposed_publicly(): void
    {
        $this->admin()->postJson('/admin/api/products', $this->payload(['collection' => 'nonsense']))
            ->assertStatus(422)->assertJsonValidationErrors('collection');

        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'Scale one', 'collection' => 'scale-figures']))->assertCreated();
        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'Chix one', 'collection' => 'chix-figures', 'figureType' => 'prize']))->assertCreated();

        $this->getJson('/api/products?collection=scale-figures')->assertOk()
            ->assertJsonCount(1)->assertJsonPath('0.name', 'Scale one')->assertJsonPath('0.collection', 'scale-figures');
    }

    public function test_main_categories_exist_and_admin_can_change_their_picture(): void
    {
        $this->seed(\Database\Seeders\CategorySeeder::class);
        $unauthorised = \App\Models\Category::firstOrFail();
        // Checked before admin() is used: withSession() sticks to the test for every later request.
        $this->putJson("/admin/api/categories/{$unauthorised->id}", ['label' => 'x'])->assertUnauthorized();

        $slugs = collect($this->getJson('/api/categories')->assertOk()->json())->pluck('slug')->all();
        $this->assertSame(['anime-figures', 'scale-figures', 'rare-exclusive', 'chix-figures'], $slugs);

        $category = \App\Models\Category::where('slug', 'chix-figures')->firstOrFail();
        $this->admin()->putJson("/admin/api/categories/{$category->id}", [
            'label' => 'CHIX Figures',
            'image' => 'https://cdn.example.com/categories/chix.jpg',
            'accent' => '#22c55e',
            'style' => 'glow',
        ])->assertOk()->assertJsonPath('image', 'https://cdn.example.com/categories/chix.jpg')
            ->assertJsonPath('style', 'glow')->assertJsonPath('accent', '#22C55E')->assertJsonMissingPath('font');

        $this->admin()->putJson("/admin/api/categories/{$category->id}", ['label' => 'x', 'accent' => 'red', 'style' => 'wild'])
            ->assertStatus(422)->assertJsonValidationErrors(['accent', 'style']);

        $this->getJson('/api/categories')->assertJsonPath('3.image', 'https://cdn.example.com/categories/chix.jpg');

        // Seeding again must not wipe the picture the admin set.
        $this->seed(\Database\Seeders\CategorySeeder::class);
        $this->assertSame('https://cdn.example.com/categories/chix.jpg', $category->fresh()->image_url);
    }

    public function test_admin_can_add_a_category_and_file_products_under_it(): void
    {
        // Checked before admin() is used: withSession() sticks to the test for every later request.
        $this->postJson('/admin/api/categories', ['label' => 'Gundam Kits'])->assertUnauthorized();

        $created = $this->admin()->postJson('/admin/api/categories', [
            'label' => 'Gundam Kits',
            'sublabel' => 'Model kits',
            'accent' => '#3b82f6',
            'style' => 'bold',
            'image' => 'https://cdn.example.com/categories/gundam.jpg',
        ])->assertCreated()
            ->assertJsonPath('slug', 'gundam-kits')
            ->assertJsonPath('label', 'Gundam Kits')
            ->assertJsonPath('accent', '#3B82F6')
            ->assertJsonPath('style', 'bold')
            ->assertJsonPath('sortOrder', 5);

        // It is listed publicly (last) and products can be filed under it straight away.
        $slugs = collect($this->getJson('/api/categories')->assertOk()->json())->pluck('slug')->all();
        $this->assertSame('gundam-kits', end($slugs));

        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'RX-78', 'collection' => $created->json('slug')]))->assertCreated();
        $this->getJson('/api/products?collection=gundam-kits')->assertOk()->assertJsonCount(1);
    }

    public function test_new_category_needs_a_unique_name_and_never_takes_a_reserved_slug(): void
    {
        $this->admin()->postJson('/admin/api/categories', ['label' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('label');

        // Same name as an existing category (any letter case) is refused.
        $this->admin()->postJson('/admin/api/categories', ['label' => 'anime FIGURES'])
            ->assertStatus(422)->assertJsonValidationErrors('label');

        // Different names that slug the same get a numbered slug instead of colliding.
        $this->admin()->postJson('/admin/api/categories', ['label' => 'Mecha!'])->assertCreated()->assertJsonPath('slug', 'mecha');
        $this->admin()->postJson('/admin/api/categories', ['label' => 'Mecha?'])->assertCreated()->assertJsonPath('slug', 'mecha-2');

        // Slugs the shop already uses as page names are skipped.
        $this->admin()->postJson('/admin/api/categories', ['label' => 'Cart'])->assertCreated()->assertJsonPath('slug', 'cart-2');
    }

    public function test_admin_can_delete_a_category_and_move_its_products(): void
    {
        $empty = \App\Models\Category::create(['slug' => 'empty-shelf', 'label' => 'Empty Shelf', 'sort_order' => 9]);
        $this->deleteJson("/admin/api/categories/{$empty->id}")->assertUnauthorized();

        // A category with no products can simply be deleted.
        $this->admin()->deleteJson("/admin/api/categories/{$empty->id}")->assertOk()->assertJsonPath('moved', 0);
        $this->assertDatabaseMissing('categories', ['slug' => 'empty-shelf']);

        // One that still has products asks where they should go...
        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'Chix A', 'collection' => 'chix-figures', 'figureType' => 'prize']))->assertCreated();
        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'Chix B', 'collection' => 'chix-figures', 'figureType' => 'prize']))->assertCreated();
        $chix = \App\Models\Category::where('slug', 'chix-figures')->firstOrFail();

        $this->admin()->deleteJson("/admin/api/categories/{$chix->id}")
            ->assertStatus(422)->assertJsonValidationErrors('moveTo');
        // ...and not to itself or to something that doesn't exist.
        $this->admin()->deleteJson("/admin/api/categories/{$chix->id}", ['moveTo' => 'chix-figures'])->assertStatus(422);
        $this->admin()->deleteJson("/admin/api/categories/{$chix->id}", ['moveTo' => 'nope'])->assertStatus(422);
        $this->assertDatabaseHas('categories', ['slug' => 'chix-figures']);

        $this->admin()->deleteJson("/admin/api/categories/{$chix->id}", ['moveTo' => 'scale-figures'])
            ->assertOk()->assertJsonPath('moved', 2)->assertJsonPath('movedTo', 'scale-figures');

        $this->assertDatabaseMissing('categories', ['slug' => 'chix-figures']);
        $this->getJson('/api/products?collection=scale-figures')->assertOk()->assertJsonCount(2);
        $this->getJson('/api/products?collection=chix-figures')->assertOk()->assertJsonCount(0);

        // A deleted category can no longer be chosen for a product.
        $this->admin()->postJson('/admin/api/products', $this->payload(['name' => 'Late', 'collection' => 'chix-figures']))
            ->assertStatus(422)->assertJsonValidationErrors('collection');
    }

    public function test_the_last_category_cannot_be_deleted(): void
    {
        \App\Models\Category::where('slug', '!=', 'anime-figures')->delete();
        $last = \App\Models\Category::firstOrFail();

        $this->admin()->deleteJson("/admin/api/categories/{$last->id}")
            ->assertStatus(422)->assertJsonValidationErrors('category');
        $this->assertDatabaseCount('categories', 1);
    }

    public function test_reseeding_does_not_bring_back_a_deleted_category(): void
    {
        $chix = \App\Models\Category::where('slug', 'chix-figures')->firstOrFail();
        $this->admin()->deleteJson("/admin/api/categories/{$chix->id}")->assertOk();

        $this->seed(\Database\Seeders\CategorySeeder::class);

        $this->assertDatabaseMissing('categories', ['slug' => 'chix-figures']);
    }

    public function test_admin_list_puts_the_most_recently_changed_product_first(): void
    {
        $a = Product::factory()->create(['name' => 'A', 'updated_at' => now()->subDays(3)]);
        $b = Product::factory()->create(['name' => 'B', 'updated_at' => now()->subDays(2)]);
        $c = Product::factory()->create(['name' => 'C', 'updated_at' => now()->subDays(1)]);

        $order = fn () => collect($this->admin()->getJson('/admin/api/products')->assertOk()->json())->pluck('name')->all();
        $this->assertSame(['C', 'B', 'A'], $order());

        $this->admin()->putJson("/admin/api/products/{$a->id}", $this->payload(['name' => 'A', 'series' => $a->series, 'condition' => $a->condition, 'price' => 777]))->assertOk();
        $this->assertSame(['A', 'C', 'B'], $order());

        $this->admin()->patchJson("/admin/api/products/{$b->id}/stock", ['inStock' => ! $b->in_stock])->assertOk();
        $this->assertSame(['B', 'A', 'C'], $order());
    }

    public function test_admin_can_toggle_featured_with_one_request(): void
    {
        $product = Product::factory()->create(['is_featured' => false]);

        $this->patchJson("/admin/api/products/{$product->id}/featured", ['isFeatured' => true])->assertUnauthorized();

        $this->admin()->patchJson("/admin/api/products/{$product->id}/featured", ['isFeatured' => true])
            ->assertOk()->assertJsonPath('isFeatured', true);
        $this->assertTrue($product->fresh()->is_featured);
    }

    public function test_bulk_actions_feature_unfeature_stock_and_delete(): void
    {
        $products = Product::factory()->count(3)->create(['is_featured' => false, 'in_stock' => true]);
        $ids = $products->pluck('id')->all();
        $untouched = Product::factory()->create(['is_featured' => false, 'in_stock' => true]);

        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => $ids, 'action' => 'feature'])
            ->assertOk()->assertJsonCount(3, 'products');
        $this->assertSame(3, Product::where('is_featured', true)->count());
        $this->assertFalse($untouched->fresh()->is_featured);

        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => $ids, 'action' => 'unfeature'])->assertOk();
        $this->assertSame(0, Product::where('is_featured', true)->count());

        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => $ids, 'action' => 'out_of_stock'])->assertOk();
        $this->assertSame(1, Product::where('in_stock', true)->count());

        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => $ids, 'action' => 'in_stock'])->assertOk();
        $this->assertSame(4, Product::where('in_stock', true)->count());

        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => $ids, 'action' => 'delete'])
            ->assertOk()->assertJsonCount(3, 'deleted');
        $this->assertSame(1, Product::count());
    }

    public function test_bulk_requires_admin_and_valid_input(): void
    {
        $product = Product::factory()->create();

        $this->postJson('/admin/api/products/bulk', ['ids' => [$product->id], 'action' => 'feature'])->assertUnauthorized();
        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => [], 'action' => 'feature'])->assertStatus(422);
        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => [$product->id], 'action' => 'explode'])->assertStatus(422);
    }

    public function test_existing_conditions_are_migrated_to_the_new_names(): void
    {
        \Illuminate\Support\Facades\DB::table('products')->insert([
            ['name' => 'Old sealed', 'series' => 'S', 'condition' => 'Sealed', 'price' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Old new', 'series' => 'S', 'condition' => 'New', 'price' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Old preowned', 'series' => 'S', 'condition' => 'Pre-owned', 'price' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Old loose', 'series' => 'S', 'condition' => 'Loose', 'price' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        (include database_path('migrations/2026_10_18_000001_rename_product_conditions.php'))->up();

        $this->assertEqualsCanonicalizing(
            ['Old sealed' => 'MISB', 'Old new' => 'MIB', 'Old preowned' => 'LOOSE', 'Old loose' => 'LOOSE'],
            Product::pluck('condition', 'name')->all(),
        );
    }

    // ── Public list: lean payload, caching ──────────────────────────────────

    public function test_list_is_lean_but_detail_has_everything(): void
    {
        $product = Product::factory()->create([
            'images' => ['https://x.test/1.jpg', 'https://x.test/2.jpg', 'https://x.test/3.jpg'],
            'description' => 'A long description',
        ]);

        $row = $this->getJson('/api/products')->assertOk()->json('0');
        $this->assertCount(1, $row['images']);
        $this->assertSame('', $row['description']);

        $this->getJson("/api/products/{$product->id}")->assertOk()
            ->assertJsonCount(3, 'images')->assertJsonPath('description', 'A long description');
    }

    public function test_list_supports_etag_and_is_refreshed_after_any_change(): void
    {
        $a = Product::factory()->create(['name' => 'Alpha', 'is_featured' => false]);

        $first = $this->getJson('/api/products')->assertOk();
        $etag = $first->headers->get('ETag');
        $this->assertNotEmpty($etag);
        $this->assertStringContainsString('max-age', $first->headers->get('Cache-Control'));

        // Same list again -> "not modified"
        $this->withHeaders(['If-None-Match' => $etag])->getJson('/api/products')->assertStatus(304);

        // Eloquent change
        $a->update(['name' => 'Alpha v2']);
        $this->getJson('/api/products')->assertJsonPath('0.name', 'Alpha v2');

        // New product
        Product::factory()->create(['name' => 'Beta']);
        $this->getJson('/api/products')->assertJsonCount(2);

        // Bulk edit (query-builder update, no model events) must also refresh the list
        $this->getJson('/api/products')->assertOk();
        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => [$a->id], 'action' => 'feature'])->assertOk();
        $this->assertTrue(collect($this->getJson('/api/products')->json())->firstWhere('id', (string) $a->id)['isFeatured']);

        // Bulk delete
        $this->admin()->postJson('/admin/api/products/bulk', ['ids' => [$a->id], 'action' => 'delete'])->assertOk();
        $this->getJson('/api/products')->assertJsonCount(1);
    }
}
