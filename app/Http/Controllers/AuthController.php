<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Notifications\SendOtpNotification;

class AuthController extends Controller
{
    /**
     * Handle user registration
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'sometimes|integer|exists:roles,id',
        ]);

        try {
            // Generate OTP (6 digits)
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'role_id' => $validated['role_id'] ?? 2, // Default role ID (2 for regular users)
                'otp' => $otp,
                'otp_expires_at' => Carbon::now()->addHours(24), // OTP valid for 24 hours
                'remember_token' => Str::random(10),
            ]);

            // Send OTP to user's email
            $user->notify(new SendOtpNotification($otp));

            // Log the user in
            Auth::login($user);

            // Return success response
            return response()->json([
                'message' => 'Registration successful. Please verify your email with the OTP sent to your email address.',
                'user' => $user->only(['id', 'name', 'email', 'username']),
                // In production, don't send OTP in the response
                // 'otp' => $otp // Only for development/testing
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Verify OTP for email verification
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Email verified successfully',
        ]);
    }

    /**
     * Resend OTP
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified',
            ], 400);
        }

        // Generate new OTP
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addHours(24);
        $user->save();

        // Send new OTP to user's email
        $user->notify(new SendOtpNotification($otp));

        return response()->json([
            'message' => 'New OTP sent to your email',
            // 'otp' => $otp // Only for development/testing
        ]);
    }

    /**
     * Handle user login
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Check if user exists and password is correct
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Check if email is verified
            if (!$user->email_verified_at) {
                return response()->json([
                    'message' => 'Please verify your email first. Check your email for the OTP.',
                    'requires_verification' => true,
                    'email' => $user->email
                ], 403);
            }

            // Revoke all tokens...
            $user->tokens()->delete();
            
            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user->only(['id', 'name', 'email', 'username', 'role_id']),
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during login. Please try again.'
            ], 500);
        }
    }

    /**
     * Handle user logout
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Revoke all of the user's tokens
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Successfully logged out',
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during logout. Please try again.'
            ], 500);
        }
    }
    
    /**
     * Get the authenticated user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->only(['id', 'name', 'email', 'username', 'role_id'])
        ]);
    }
}
