<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Panda's Attic · Admin</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="theme-color" content="#0A0A0B">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin.tsx'])
</head>
<body class="bg-[#0A0A0B] text-gray-100 antialiased">
    <form id="admin-logout-form" method="POST" action="{{ route('admin.logout') }}" style="display: none;">
        @csrf
    </form>
    <div id="admin-root"></div>
</body>
</html>