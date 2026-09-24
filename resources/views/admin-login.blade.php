<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0A0A0B;
            font-family: 'Segoe UI', Inter, sans-serif;
        }
        .card {
            background: #111114;
            border: 1px solid {{ $errors->any() ? 'rgba(255,45,120,0.4)' : '#222228' }};
            border-radius: 1rem;
            padding: 28px 24px;
            width: 100%;
            max-width: 340px;
        }
        .icon { display: flex; justify-content: center; margin-bottom: 16px; color: #FF2D78; }
        h1 { font-size: 17px; color: #F0F0F4; text-align: center; margin: 0 0 4px; font-weight: 700; }
        p.sub { color: #50505C; font-size: 12px; text-align: center; margin: 0 0 20px; }
        input[type="password"] {
            background: #0A0A0B;
            border: 1px solid {{ $errors->any() ? '#FF2D78' : '#222228' }};
            color: #F0F0F4;
            border-radius: 0.5rem;
            font-size: 16px;
            outline: none;
            width: 100%;
            padding: 10px 16px;
            text-align: center;
            box-sizing: border-box;
            margin-bottom: 4px;
        }
        .error { color: #FF2D78; font-size: 12px; text-align: center; margin: 8px 0 0; }
        button {
            background: #FF2D78;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            border-radius: 9999px;
            padding: 10px;
            width: 100%;
            border: none;
            cursor: pointer;
            margin-top: 16px;
        }
        button:hover { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="12" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.5" />
                <path d="M9 12V8.5C9 5.46 11.46 3 14.5 3C17.54 3 20 5.46 20 8.5V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="14.5" cy="18.5" r="2" fill="currentColor" />
            </svg>
        </div>
        <h1>Admin Access</h1>
        <p class="sub">Enter your password to continue</p>

        <form method="POST" action="{{ route('admin.login.attempt') }}">
            @csrf
            <input type="password" name="password" placeholder="••••••••" autofocus>
            @error('password')
                <p class="error">{{ $message }}</p>
            @enderror
            <button type="submit">Enter</button>
        </form>
    </div>
</body>
</html>
