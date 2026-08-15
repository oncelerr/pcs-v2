<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\UserProgressController;
use App\Http\Controllers\Api\StateServiceRequestController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserInformationController;
use App\Http\Controllers\DocumentAccessController;
use App\Http\Controllers\ComplianceUserController;
use App\Http\Controllers\ClientComplianceFileController;
use App\Http\Controllers\UserDocumentController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminActivityLogController;
use App\Http\Controllers\AdminReportController;

// Secure document access with signed URLs
Route::get('/document/view', [DocumentAccessController::class, 'viewDocument'])
    ->middleware(['signed'])
    ->name('document.view');
    
// Direct document viewing with file path
Route::get('/document/direct-view', [DocumentAccessController::class, 'viewDirectDocument'])
    ->middleware(['signed'])
    ->name('document.direct-view');

Route::post('/api/secure-document-urls', [DocumentAccessController::class, 'getSecureUrls']);
Route::post('/api/document-access-token', [DocumentAccessController::class, 'getAccessToken']);
Route::post('/api/get-document-url', [DocumentAccessController::class, 'getDocumentUrl']);

// API Routes
Route::group(['prefix' => 'api'], function () {
    // Registration
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/addcan', [AuthController::class, 'addcan']);

    // Email Verification
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/progress', [UserProgressController::class, 'index']);

        // User Documents Routes
        Route::get('/user-documents', [UserDocumentController::class, 'index']);
        Route::get('/user-documents/{id}', [UserDocumentController::class, 'show']);
        Route::get('/user/{userId}/documents', [UserDocumentController::class, 'getUserDocuments']);
        
        // State Service Request Routes (User)
        Route::prefix('state-service-request')->group(function () {
            Route::post('/', [StateServiceRequestController::class, 'store']);
            Route::get('/', [StateServiceRequestController::class, 'index']);
            Route::get('/{stateServiceRequest}', [StateServiceRequestController::class, 'show']);
            Route::post('/{stateServiceRequest}/cancel', [StateServiceRequestController::class, 'cancel']);
        });
        
        // Change own password (authenticated user)
        Route::post('/change-password', [\App\Http\Controllers\PasswordResetController::class, 'changeOwnPassword']);

        // Get authenticated user's profile
        Route::get('/my-profile', [\App\Http\Controllers\UserInformationController::class, 'getMyProfile']);

        // State Service Request Routes (Admin Only)
        Route::middleware('admin')->prefix('admin/state-service-requests')->group(function () {
            Route::get('/', [StateServiceRequestController::class, 'adminIndex']);
            Route::put('/{stateServiceRequest}', [StateServiceRequestController::class, 'update']);
            Route::patch('/{stateServiceRequest}/assign', [StateServiceRequestController::class, 'assign']);
        });

        // Manually mark a user as paid/unpaid while Stripe checkout is disabled (Admin Only)
        Route::middleware('admin')->patch('/admin/users/{userId}/payment-status', [PaymentController::class, 'updatePaymentStatus']);

        // Admin account management (Admin Only)
        Route::middleware('admin')->prefix('admin/admins')->group(function () {
            Route::get('/', [AuthController::class, 'listAdmins']);
            Route::post('/', [AuthController::class, 'createAdminAccount']);
            Route::post('/{id}/reset-password', [AuthController::class, 'resetAdminPassword']);
        });

        // Admin activity log (Admin Only)
        Route::middleware('admin')->get('/admin/activity-logs', [AdminActivityLogController::class, 'index']);

        // Admin reports: automated summaries + manual reports requiring 2-admin approval (Admin Only)
        Route::middleware('admin')->prefix('admin/reports')->group(function () {
            Route::get('/', [AdminReportController::class, 'index']);
            Route::get('/{report}', [AdminReportController::class, 'show']);
            Route::post('/generate-automated', [AdminReportController::class, 'generateAutomated']);
            Route::post('/manual', [AdminReportController::class, 'storeManual']);
            Route::post('/{report}/approve', [AdminReportController::class, 'approve']);
            Route::post('/{report}/reject', [AdminReportController::class, 'reject']);
        });
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

Route::group(['prefix' => 'api'], function () {
    Route::post('/submit-form', [\App\Http\Controllers\FormSubmitController::class, 'store']);
    Route::post('/submit-form-for-candidate', [\App\Http\Controllers\FormSubmitController::class, 'storeForCandidate']);
});

// Admin dashboard activity log route
Route::get('/admin/activities', [ActivityLogController::class, 'getRecentActivities']);

// Notification routes
Route::prefix('api/notifications')->group(function () {
    Route::get('/user/{userId}', [\App\Http\Controllers\NotificationController::class, 'getUserNotifications']);
    Route::post('/{notificationId}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
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