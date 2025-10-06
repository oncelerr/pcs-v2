<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\UserStageItem;
use App\Models\Stage;
use App\Models\ComplianceUser;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'plan' => 'required|string'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

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

            // Get the base URL from environment configuration
            $baseUrl = env('APP_URL', 'http://localhost:8000');
        
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
            'cancel_url' => $baseUrl . '/payment-cancel',
        ]);

            return response()->json([
                'id' => $session->id,
                'url' => $session->url
            ]);
            
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Log::error('Stripe API Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Payment processing error. Please try again.'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Payment Controller Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.'
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

            // Verify the session with Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $session = Session::retrieve($sessionId);
            
            if ($session->payment_status !== 'paid') {
                return response()->json(['error' => 'Payment not completed'], 400);
            }
            
            // Create or update compliance user record
            ComplianceUser::updateOrCreate(
                ['user_id' => $userId],
                [
                    'compliance_status' => ComplianceUser::STATUS_DONE,
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

            return response()->json([
                'message' => 'Payment processed successfully',
                'payment_stage_completed' => $paymentStageCompleted,
                'next_payment_stage_activated' => $nextPaymentStageActivated,
                'setup_stage_completed' => $setupStageCompleted,
                'next_setup_stage_activated' => $nextSetupStageActivated,
                'compliance_record_created' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Payment Success Handler Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while processing payment success.'
            ], 500);
        }
    }
}
