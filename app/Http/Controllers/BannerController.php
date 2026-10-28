<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Banner::activeSlides());
    }
}
