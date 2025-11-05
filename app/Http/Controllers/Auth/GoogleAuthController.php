<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\NotificationController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Carbon\Carbon;
use App\Services\UserStageItemService;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request)
    {
        // Persist desired redirect location (defaults to /dashboard)
        $redirect = $request->query('redirect', url('/dashboard'));
        $request->session()->put('google_oauth_redirect', $redirect);

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request)
    {
        try {
            // Retrieve the Google user (stateful session flow)
            $googleUser = Socialite::driver('google')->user();

            // Find existing user by email, or create a new one
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Build a username from the email prefix, ensure uniqueness
                $baseUsername = Str::before($googleUser->getEmail(), '@') ?: Str::slug($googleUser->getName() ?: 'user');
                $username = $baseUsername;
                $i = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . $i;
                    $i++;
                }

                $user = User::create([
                    'name' => $googleUser->getName() ?: $baseUsername,
                    'email' => $googleUser->getEmail(),
                    'username' => $username,
                    // Random password since Google users won't log in with password
                    'password' => Str::random(32),
                    'role_id' => 2,
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]);

                // Initialize user stage items
                UserStageItemService::initializeFor($user);
                
                // Notify admins about new user registration via Google
                try {
                    $notificationController = new NotificationController();
                    $notificationController->notifyAdmins(
                        'New Google User Registration',
                        "A new user {$user->name} ({$user->email}) has registered via Google OAuth.",
                        [
                            'type' => 'google_user_registration',
                            'data' => [
                                'user_id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'username' => $user->username,
                                'registered_at' => now()->toDateTimeString(),
                                'auth_provider' => 'google'
                            ]
                        ]
                    );
                } catch (\Exception $e) {
                    // Log error but continue with registration process
                    Log::error('Failed to send admin notification about new Google user', ['error' => $e->getMessage()]);
                }
            } else {
                // Ensure verified if coming from Google
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $user->save();
                }
            }

            // Auth::login($user, true);

            // Revoke old tokens and create a new Sanctum token
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            // Determine where to send the user back in the SPA
            $redirect = $request->session()->pull('google_oauth_redirect', url('/dashboard'));

            // Append token and a success flag as query params so SPA can capture
            $separator = str_contains($redirect, '?') ? '&' : '?';
            $redirectWithToken = $redirect . $separator . 'token=' . urlencode($token) . '&provider=google&status=success';

            return redirect()->away($redirectWithToken);
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $redirect = $request->session()->pull('google_oauth_redirect', url('/login'));
            $separator = str_contains($redirect, '?') ? '&' : '?';
            $redirectError = $redirect . $separator . 'oauth_error=' . urlencode('Google authentication failed');
            return redirect()->away($redirectError);
        }
    }
}
