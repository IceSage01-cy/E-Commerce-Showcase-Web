<?php

use App\Http\Controllers\Admin\AnimeCoverController as AdminAnimeCoverController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\AnimeCoverController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ImageProxyController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public, read-only — used by the homepage HeroSlider and storefront.
// Throttled per IP so the catalogue can't be hammered (each uncached list read is a database query).
Route::middleware('throttle:120,1')->group(function () {
    Route::get('/api/banners', [BannerController::class, 'index'])->name('banners.index');
    Route::get('/api/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/api/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/api/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/api/anime-covers', [AnimeCoverController::class, 'index'])->name('anime-covers.index');
});

// Used by the receipt "Download as Image" button to fetch R2 images
// same-origin so the browser doesn't taint the canvas.
Route::get('/api/image-proxy', [ImageProxyController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('image-proxy');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:6,1') // 6 attempts per minute, brute-force protection
        ->name('login.attempt');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

    Route::middleware('admin.auth')->group(function () {
        Route::get('/', function () {
            return view('admin');
        })->name('dashboard');

        Route::prefix('api/banners')->name('banners.')->group(function () {
            Route::get('/', [AdminBannerController::class, 'index'])->name('index');
            Route::post('/', [AdminBannerController::class, 'store'])->name('store');
            Route::put('/{banner}', [AdminBannerController::class, 'update'])->name('update');
            Route::delete('/{banner}', [AdminBannerController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('api/products')->name('products.')->group(function () {
            Route::get('/', [AdminProductController::class, 'index'])->name('index');
            Route::post('/', [AdminProductController::class, 'store'])->name('store');
            Route::put('/{product}', [AdminProductController::class, 'update'])->name('update');
            Route::post('/bulk', [AdminProductController::class, 'bulk'])->name('bulk');
            Route::patch('/{product}/stock', [AdminProductController::class, 'setStock'])->name('stock');
            Route::patch('/{product}/featured', [AdminProductController::class, 'setFeatured'])->name('featured');
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('api/categories')->name('categories.')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index'])->name('index');
            Route::post('/', [AdminCategoryController::class, 'store'])->name('store');
            Route::put('/{category}', [AdminCategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [AdminCategoryController::class, 'destroy'])->name('destroy');
        });

        Route::post('/api/uploads', [AdminUploadController::class, 'store'])->name('uploads.store');

        Route::get('/api/anime-covers', [AdminAnimeCoverController::class, 'index'])->name('anime-covers.index');
        Route::put('/api/anime-covers', [AdminAnimeCoverController::class, 'update'])->name('anime-covers.update');
    });
});
