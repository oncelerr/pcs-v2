<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Http\Controllers\NotificationController;
use App\Models\User;
use App\Models\UserStageItem;
use App\Models\Stage;
use App\Models\ComplianceUser;

class PaymentController extends Controller
{
    /**
     * Verify Stripe configuration
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyStripeConfig()
    {
        try {
            // Use config() instead of env()
            $stripeKey = config('services.stripe.secret');
            $appUrl = config('app.url');
            $stripeKeyMasked = !empty($stripeKey) ? substr($stripeKey, 0, 4) . '...' . substr($stripeKey, -4) : null;
            
            // Check if Stripe key is set
            if (empty($stripeKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stripe secret key is not configured',
                    'config' => [
                        'stripe_key_set' => false,
                        'app_url' => $appUrl
                    ]
                ]);
            }
            
            // Try to initialize Stripe
            Stripe::setApiKey($stripeKey);
            
            // Try to make a simple API call to verify the key works
            $balance = \Stripe\Balance::retrieve();
            
            return response()->json([
                'success' => true,
                'message' => 'Stripe configuration is valid',
                'config' => [
                    'stripe_key_set' => true,
                    'stripe_key_prefix' => substr($stripeKeyMasked, 0, 6),
                    'app_url' => $appUrl,
                    'available_balance' => $balance->available[0]->amount ?? 0
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe Config Verification Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Stripe configuration error: ' . $e->getMessage(),
                'config' => [
                    'stripe_key_set' => !empty(config('services.stripe.secret')),
                    'app_url' => config('app.url'),
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
    }
    
    public function createCheckoutSession(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'plan' => 'required|string'
            ]);

            // Check if Stripe secret key is set - use config() instead of env()
            $stripeKey = config('services.stripe.secret');
            if (empty($stripeKey)) {
                \Log::error('Stripe secret key is not set in configuration');
                return response()->json(['error' => 'Payment configuration error. Please contact support.'], 500);
            }
            
            Stripe::setApiKey($stripeKey);

            $plan = $request->plan;

            // Map plans to Stripe price (in cents)
            $pricing = [
                "LLC Basic Plan" => 34900,
                "Corp Basic Plan" => 39900,
                "LLC Premium Plan" => 49900,
                "Corp Premium Plan" => 59900,
            ];

            if (!isset($pricing[$plan])) {
                return response()->json(['error' => 'Invalid plan selected'], 400);
            }

            // Get the base URL from configuration
            $baseUrl = config('app.url', 'https://test.premiumcorpsolutions.com');
            
            // Log the base URL for debugging
            \Log::info('Creating checkout session', [
                'base_url' => $baseUrl,
                'amount' => $pricing[$plan]
            ]);
        
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $plan,
                        ],
                        'unit_amount' => $pricing[$plan],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $baseUrl . '/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $baseUrl . '/dashboard?status=failed',
            ]);

            return response()->json([
                'id' => $session->id,
                'url' => $session->url
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Log::error('Stripe API Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'http_status' => $e->getHttpStatus(),
                'request_id' => $e->getRequestId(),
                'stripe_code' => $e->getStripeCode()
            ]);
            
            // Notify admins about Stripe API error
            try {
                // Get user ID if available
                $userId = $request->input('user_id') ?? $request->query('user_id') ?? auth()->id();
                $userInfo = '';
                
                if ($userId) {
                    $user = User::find($userId);
                    if ($user) {
                        $userInfo = " for user {$user->name} ({$user->email})";
                    }
                }
                
                $notificationController = new NotificationController();
                $notificationController->notifyAdmins(
                    'Stripe API Error',
                    "A Stripe API error occurred{$userInfo}. Error: {$e->getMessage()}",
                    [
                        'type' => 'stripe_api_error',
                        'data' => [
                            'user_id' => $userId ?? null,
                            'error_message' => $e->getMessage(),
                            'http_status' => $e->getHttpStatus(),
                            'request_id' => $e->getRequestId(),
                            'stripe_code' => $e->getStripeCode(),
                            'error_time' => now()->toDateTimeString(),
                            'plan' => $request->plan ?? null
                        ]
                    ]
                );
            } catch (\Exception $notifyError) {
                \Log::error('Failed to send admin notification about Stripe API error', ['error' => $notifyError->getMessage()]);
            }
            
            return response()->json([
                'error' => 'Payment processing error. Please try again.',
                'debug_info' => config('app.debug', false) ? $e->getMessage() : null
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Payment Controller Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => config('app.debug', false) ? $e->getTraceAsString() : null
            ]);
            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.',
                'debug_info' => config('app.debug', false) ? $e->getMessage() : null
            ], 500);
        }
    }

    public function handlePaymentSuccess(Request $request)
    {
        try {
            // Get parameters from request body (JSON) or query string
            $sessionId = $request->input('session_id') ?? $request->query('session_id');
            $userId = $request->input('user_id') ?? $request->query('user_id');
            
            if (!$sessionId || !$userId) {
                \Log::error('Payment Success - Missing parameters', [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'request_data' => $request->all()
                ]);
                return response()->json(['error' => 'Missing required parameters'], 400);
            }

            // Check if Stripe secret key is set - use config() instead of env()
            $stripeKey = config('services.stripe.secret');
            if (empty($stripeKey)) {
                \Log::error('Stripe secret key is not set in configuration');
                return response()->json(['error' => 'Payment configuration error. Please contact support.'], 500);
            }
            
            // Verify the session with Stripe
            Stripe::setApiKey($stripeKey);
            
            try {
                $session = Session::retrieve($sessionId);
            } catch (\Exception $e) {
                \Log::error('Failed to retrieve Stripe session', [
                    'session_id' => $sessionId,
                    'error' => $e->getMessage()
                ]);
                return response()->json(['error' => 'Invalid payment session'], 400);
            }
            
            if ($session->payment_status !== 'paid') {
                return response()->json(['error' => 'Payment not completed'], 400);
            }
            
            // Create or update compliance user record
            ComplianceUser::updateOrCreate(
                ['user_id' => $userId],
                [
                    'compliance_status' => ComplianceUser::STATUS_PENDING,
                    'state_registration_status' => ComplianceUser::STATUS_PENDING,
                    'bio_filing_status' => ComplianceUser::STATUS_PENDING,
                    'ein_filing_status' => ComplianceUser::STATUS_PENDING,
                    'bank_registration_status' => ComplianceUser::STATUS_PENDING,
                    'process_status' => ComplianceUser::STATUS_PENDING,
                    'annual_franchise_tax' => '',
                    'annual_irs_tax' => ''
                ]
            );

            // Update Payment stage item from active to completed
            $paymentStageCompleted = false;
            $nextPaymentStageActivated = false;
            
            $paymentStageItem = UserStageItem::where('user_id', $userId)
                ->whereHas('stageItem', function ($query) {
                    $query->where('name', 'Payment');
                })
                ->where('status', UserStageItem::STATUS_ACTIVE)
                ->first();

            if ($paymentStageItem) {
                $paymentStageCompleted = $paymentStageItem->markAsCompleted();
                
                // Find and activate the next stage item
                $currentStageItemId = $paymentStageItem->stage_item_id;
                $nextStageItem = UserStageItem::where('user_id', $userId)
                    ->where('stage_item_id', $currentStageItemId + 1)
                    ->where('status', UserStageItem::STATUS_PENDING)
                    ->first();
                
                if ($nextStageItem) {
                    $nextPaymentStageActivated = $nextStageItem->update([
                        'status' => UserStageItem::STATUS_ACTIVE
                    ]);
                }
            }

            // Update Setup stage from active to completed
            $setupStageCompleted = false;
            $nextSetupStageActivated = false;
            
            $setupStage = UserStageItem::where('user_id', $userId)
                ->whereHas('stage', function ($query) {
                    $query->where('name', 'Setup');
                })
                ->where('status', UserStageItem::STATUS_ACTIVE)
                ->first();

            if ($setupStage) {
                $setupStageCompleted = $setupStage->update([
                    'status' => UserStageItem::STATUS_DONE
                ]);
                
                // Find and activate the next stage
                $currentStageId = $setupStage->stage_id;
                $nextStage = UserStageItem::where('user_id', $userId)
                    ->where('stage_id', $currentStageId + 1)
                    ->where('status', UserStageItem::STATUS_PENDING)
                    ->first();
                
                if ($nextStage) {
                    $nextSetupStageActivated = $nextStage->update([
                        'status' => UserStageItem::STATUS_ACTIVE
                    ]);
                }
            }

            // Get user details for notification
            $user = User::find($userId);
            
            // Notify admins about successful payment
            try {
                $notificationController = new NotificationController();
                
                // Get plan name and amount from session
                $planName = $session->display_items[0]->custom->name ?? 'Unknown Plan';
                $amount = $session->amount_total ? number_format($session->amount_total / 100, 2) : 'Unknown';
                
                $notificationController->notifyAdmins(
                    'Payment Successful',
                    "User {$user->name} ({$user->email}) has successfully made a payment of \${$amount} for {$planName}.",
                    [
                        'type' => 'payment_successful',
                        'data' => [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'plan' => $planName,
                            'amount' => $amount,
                            'session_id' => $sessionId,
                            'payment_time' => now()->toDateTimeString()
                        ]
                    ]
                );
            } catch (\Exception $e) {
                // Log error but continue with the process
                \Log::error('Failed to send admin notification about payment success', ['error' => $e->getMessage()]);
            }
            
            return response()->json([
                'message' => 'Payment processed successfully',
                'payment_stage_completed' => $paymentStageCompleted,
                'next_payment_stage_activated' => $nextPaymentStageActivated,
                'setup_stage_completed' => $setupStageCompleted,
                'next_setup_stage_activated' => $nextSetupStageActivated,
                'compliance_record_created' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Payment Success Handler Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => config('app.debug', false) ? $e->getTraceAsString() : null,
                'session_id' => $sessionId ?? null,
                'user_id' => $userId ?? null
            ]);
            
            // Notify admins about payment processing error
            if ($userId) {
                try {
                    $user = User::find($userId);
                    if ($user) {
                        $notificationController = new NotificationController();
                        $notificationController->notifyAdmins(
                            'Payment Processing Error',
                            "An error occurred while processing payment for user {$user->name} ({$user->email}). Error: {$e->getMessage()}",
                            [
                                'type' => 'payment_error',
                                'data' => [
                                    'user_id' => $user->id,
                                    'name' => $user->name,
                                    'email' => $user->email,
                                    'session_id' => $sessionId ?? null,
                                    'error_message' => $e->getMessage(),
                                    'error_time' => now()->toDateTimeString()
                                ]
                            ]
                        );
                    }
                } catch (\Exception $notifyError) {
                    \Log::error('Failed to send admin notification about payment error', ['error' => $notifyError->getMessage()]);
                }
            }
            
            return response()->json([
                'error' => 'An error occurred while processing payment success.',
                'debug_info' => config('app.debug', false) ? $e->getMessage() : null
            ], 500);
        }
    }
    
    /**
     * Handle payment cancellation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handlePaymentCancellation(Request $request)
    {
        try {
            // Get parameters from request
            $userId = $request->input('user_id') ?? $request->query('user_id');
            
            if (!$userId) {
                \Log::error('Payment Cancellation - Missing user ID', [
                    'request_data' => $request->all()
                ]);
                return response()->json(['error' => 'Missing user ID parameter'], 400);
            }
            
            // Get user details
            $user = User::find($userId);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            
            // Notify admins about payment cancellation
            try {
                $notificationController = new NotificationController();
                $notificationController->notifyAdmins(
                    'Payment Cancelled',
                    "User {$user->name} ({$user->email}) has cancelled their payment process.",
                    [
                        'type' => 'payment_cancelled',
                        'data' => [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'cancelled_at' => now()->toDateTimeString()
                        ]
                    ]
                );
            } catch (\Exception $e) {
                // Log error but continue with the process
                \Log::error('Failed to send admin notification about payment cancellation', ['error' => $e->getMessage()]);
            }
            
            return response()->json([
                'message' => 'Payment cancellation recorded',
                'status' => 'cancelled'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Payment Cancellation Handler Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => config('app.debug', false) ? $e->getTraceAsString() : null,
                'user_id' => $request->input('user_id') ?? $request->query('user_id') ?? null
            ]);
            
            return response()->json([
                'error' => 'An error occurred while processing payment cancellation.',
                'debug_info' => config('app.debug', false) ? $e->getMessage() : null
            ], 500);
        }
    }
}