<?php
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Controllers\Admin\DashboardController;

Route::middleware(['auth:sanctum', EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        // Additional admin-only API routes
    });