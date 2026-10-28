<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Panda's Attic</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="theme-color" content="#0A0A0B">

    {{-- Start downloading the first hero photo now, in parallel with the JavaScript. --}}
    @if ($banners->isNotEmpty() && ! empty($banners->first()['image']))
        <link rel="preload" as="image" href="{{ $banners->first()['image'] }}" fetchpriority="high">
    @endif

    @include('partials.fonts')

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])

    {{-- The hero banners, read by HeroSlider so it needs no request to /api/banners. A JSON block is data, not a script, so the CSP allows it. --}}
    @if ($banners->isNotEmpty())
        <script type="application/json" id="initial-banners">@json($banners)</script>
    @endif
</head>
<body class="antialiased">
    <div id="root"></div>
</body>
</html>