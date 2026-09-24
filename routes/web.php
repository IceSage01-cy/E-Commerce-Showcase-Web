<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public, read-only — used by the homepage HeroSlider and storefront.
Route::get('/api/banners', [BannerController::class, 'index'])->name('banners.index');
Route::get('/api/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/api/products/{product}', [ProductController::class, 'show'])->name('products.show');

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
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
        });

        Route::post('/api/uploads', [AdminUploadController::class, 'store'])->name('uploads.store');
    });
});
