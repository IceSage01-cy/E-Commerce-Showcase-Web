<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Contracts\View\View;

class HomeController extends Controller
{
    /**
     * The storefront shell. The hero banners are put in the page itself so the browser can start
     * downloading the first banner photo straight away, instead of waiting for the JavaScript to
     * run and then for a separate /api/banners request.
     */
    public function __invoke(): View
    {
        // A database hiccup must not take the whole page down; the hero then falls back to /api/banners.
        $banners = rescue(fn () => Banner::activeSlides(), collect(), report: true);

        return view('welcome', ['banners' => $banners]);
    }
}
