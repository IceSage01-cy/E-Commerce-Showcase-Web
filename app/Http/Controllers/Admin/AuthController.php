<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(): View
    {
        return view('admin-login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $expected = (string) config('admin.password');
        $given = (string) $request->input('password');

        // hash_equals prevents timing attacks compared to === .
        if ($expected === '' || ! hash_equals($expected, $given)) {
            Log::warning('Failed admin login attempt', ['ip' => $request->ip()]);

            return back()->withErrors(['password' => 'Incorrect password.'])->onlyInput();
        }

        // Regenerate the session id on privilege escalation to prevent
        // session fixation attacks.
        $request->session()->regenerate();
        $request->session()->put('is_admin', true);

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('is_admin');
        $request->session()->regenerate();

        return redirect('/');
    }
}
