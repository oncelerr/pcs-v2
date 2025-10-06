<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\UserProgressController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserInformationController;
use App\Http\Controllers\DocumentAccessController;
use App\Http\Controllers\ComplianceUserController;
use App\Http\Controllers\ClientComplianceFileController;

// Secure document access with signed URLs
Route::get('/document/view', [DocumentAccessController::class, 'viewDocument'])
    ->middleware(['signed'])
    ->name('document.view');

Route::post('/api/secure-document-urls', [DocumentAccessController::class, 'getSecureUrls']);
Route::post('/api/document-access-token', [DocumentAccessController::class, 'getAccessToken']);

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

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/progress', [UserProgressController::class, 'index']);
    });

    // Contact Form
    Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'send']);

    // ✅ Stripe checkout session
    Route::post('/create-checkout-session', [PaymentController::class, 'createCheckoutSession']);
    
    // ✅ Handle payment success
    Route::post('/payment-success', [PaymentController::class, 'handlePaymentSuccess']);
    
    // User Information routes with pagination
    Route::prefix('user-information')->group(function () {
        Route::get('/', [UserInformationController::class, 'index']);
        Route::get('/{id}', [UserInformationController::class, 'show']);
        Route::post('/', [UserInformationController::class, 'store']);
        Route::put('/{id}', [UserInformationController::class, 'update']);
        Route::delete('/{id}', [UserInformationController::class, 'destroy']);
    });
    
    // Compliance User routes with pagination
    Route::prefix('compliance-user')->group(function () {
        Route::get('/', [ComplianceUserController::class, 'index']);
        Route::get('/{id}', [ComplianceUserController::class, 'show']);
        Route::post('/', [ComplianceUserController::class, 'store']);
        Route::put('/{id}', [ComplianceUserController::class, 'update']);
        Route::delete('/{id}', [ComplianceUserController::class, 'destroy']);
        Route::post('/{id}/upload', [ComplianceUserController::class, 'uploadDocuments']);
        Route::post('/{id}/tax', [ComplianceUserController::class, 'addTaxInfo']);
    });
    
    // Client Compliance Files routes
    Route::prefix('compliance-files')->group(function () {
        Route::post('/', [ClientComplianceFileController::class, 'store']);
        Route::get('/user/{userId}', [ClientComplianceFileController::class, 'getByUser']);
        Route::get('/user/{userId}/column/{column}', [ClientComplianceFileController::class, 'getByColumn']);
    });
    
    // Password reset route
    Route::post('/reset-password/{id}', [\App\Http\Controllers\PasswordResetController::class, 'resetPassword']);
});

// Test email route
Route::get('/test-email', function () {
    try {
        Mail::raw('This is a test email', function ($message) {
            $message->to(env('MAIL_FROM_ADDRESS'))
                ->subject('Test Email');
        });
        return 'Test email sent successfully!';
    } catch (\Exception $e) {
        return 'Error sending test email: ' . $e->getMessage();
    }
});

Route::group(['prefix' => 'api'], function () {
    Route::post('/submit-form', [\App\Http\Controllers\FormSubmitController::class, 'store']);
});

// Google OAuth routes with web middleware for session handling
Route::middleware('web')->group(function () {
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');
});

// SPA catch-all route - must be the last route
Route::get('/{path?}', function () {
    return view('welcome');
})->where('path', '^(?!api).*$')->name('home');
