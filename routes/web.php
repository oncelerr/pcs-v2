<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// API Routes
Route::group(['prefix' => 'api'], function () {
    // Registration
    Route::post('/register', [AuthController::class, 'register']);
    
    // Email Verification
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    
    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    
    // Contact Form
    Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'send']);
});

// Test email route
Route::get('/test-email', function () {
    try {
        Mail::raw('This is a test email', function($message) {
            $message->to(env('MAIL_FROM_ADDRESS'))
                    ->subject('Test Email');
        });
        return 'Test email sent successfully!';
    } catch (\Exception $e) {
        return 'Error sending test email: ' . $e->getMessage();
    }
});

// SPA catch-all route - must be the last route
Route::get('/{path?}', function () {
    return view('welcome');
})->where('path', '^(?!api).*$')->name('home');