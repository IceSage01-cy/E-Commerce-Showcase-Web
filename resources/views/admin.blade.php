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
    <form method="POST" action="{{ route('admin.logout') }}"
          style="position: fixed; top: 12px; right: 16px; z-index: 100;">
        @csrf
        <button type="submit"
                style="background: #16161A; border: 1px solid #26262E; color: #80808C; font-size: 12px; padding: 6px 14px; border-radius: 9999px; cursor: pointer;">
            Log out
        </button>
    </form>
    <div id="admin-root"></div>
</body>
</html>