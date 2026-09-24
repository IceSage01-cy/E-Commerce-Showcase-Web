<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * A few real-ish placeholder photos so freshly-factoried products still look right
     * in the storefront grid before an admin uploads their own photos.
     */
    private const STOCK_IMAGES = [
        'https://images.unsplash.com/photo-1767700629009-c5b5dc7b5947?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1783765803308-fc2eba85cc2b?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1762008387452-25fe91ab3f90?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1770288784491-38537cc095b0?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1770116119330-2c80bc762d0b?w=800&h=800&fit=crop&auto=format',
    ];

    private const SERIES = ['Vocaloid', 'Dragon Ball Super', 'One Piece', 'Demon Slayer', 'Jujutsu Kaisen', 'Re:Zero', 'Chainsaw Man', 'Attack on Titan'];

    private const MANUFACTURERS = ['Good Smile Company', 'Bandai Spirits', 'Kotobukiya', 'MegaHouse', 'Max Factory', 'Aniplex'];

    public function definition(): array
    {
        $category = $this->faker->randomElement(['on-hand', 'on-hand', 'pre-order', 'new-release']);
        $price = $this->faker->numberBetween(15, 95) * 100;
        $onSale = $this->faker->boolean(25);

        return [
            'name' => $this->faker->words(3, true).' Figure',
            'series' => $this->faker->randomElement(self::SERIES),
            'character' => $this->faker->firstName(),
            'price' => $price,
            'sale_price' => $onSale ? (int) round($price * 0.85, -1) : null,
            'images' => $this->faker->randomElements(self::STOCK_IMAGES, 2),
            'category' => $category,
            'condition' => $this->faker->randomElement(['New', 'Sealed', 'Pre-owned']),
            'stock' => $this->faker->numberBetween(0, 20),
            'is_featured' => $this->faker->boolean(20),
            'date_added' => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'description' => $this->faker->paragraph(3),
            'manufacturer' => $this->faker->randomElement(self::MANUFACTURERS),
            'scale' => $this->faker->randomElement(['1/6', '1/7', '1/8', 'Non-scale']),
            'estimated_arrival' => $category === 'pre-order' ? $this->faker->monthName().' '.$this->faker->numberBetween(2027, 2028) : null,
        ];
    }
}
