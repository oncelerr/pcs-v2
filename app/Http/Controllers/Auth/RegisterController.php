<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StageItem;
use App\Models\UserStageItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Validation\Rules;

class RegisterController extends Controller
{
    /**
     * Show the registration form.
     *
     * @return \Illuminate\View\View
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'agree_terms' => ['required', 'accepted'],
        ]);

        return DB::transaction(function () use ($validated) {
            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id' => 2, // Default role ID for regular users
            ]);

            // Initialize user's progress with default stages and items
            $user->initializeProgress();

            // Log the user in
            Auth::login($user);

            return response()->json([
                'message' => 'Registration successful',
                'redirect' => route('dashboard')
            ]);
        });
    }

    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            return DB::transaction(function () use ($googleUser) {
                // Check if user already exists
                $user = User::where('email', $googleUser->getEmail())->first();

                if (!$user) {
                    // Create new user
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'password' => Hash::make(Str::random(24)), // Random password for OAuth users
                        'role_id' => 2, // Default role ID for regular users
                        'email_verified_at' => now(),
                    ]);

                    // Initialize user's progress with default stages and items
                    $user->initializeProgress();
                }

                // Log the user in
                Auth::login($user, true);

                return redirect()->intended(route('dashboard'));
            });
        } catch (\Exception $e) {
            \Log::error('Google OAuth Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to authenticate with Google. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
