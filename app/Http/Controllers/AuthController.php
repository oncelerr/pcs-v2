<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\NotificationController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Services\UserStageItemService;
use App\Services\AdminActivityLogger;
use App\Models\ComplianceUser;
use App\Models\Role;

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

            // Notify admins about new user registration
            try {
                $notificationController = new NotificationController();
                $notificationController->notifyAdmins(
                    'New User Registration',
                    "A new user {$user->name} ({$user->email}) has registered.",
                    [
                        'type' => 'user_registration',
                        'data' => [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'username' => $user->username,
                            'registered_at' => now()
                        ]
                    ]
                );
            } catch (\Exception $e) {
                // Log error but continue with registration process
                Log::error('Failed to send admin notification about new user', ['error' => $e->getMessage()]);
            }

            // Send OTP to user's email directly (no queue)
            try {
                Mail::send([], [], function ($message) use ($user, $otp) {
                    $message->to($user->email)
                        ->subject('Your OTP for Email Verification')
                        ->html(
                            '<!DOCTYPE html><html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"><head><title></title><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--[if mso]>
                            <xml><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
                            <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml>
                            <![endif]--><style>
                            *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}.image_block img+div{display:none}sub,sup{font-size:75%;line-height:0} @media (max-width:720px){.social_block.desktop_hide .social-table{display:inline-block!important}.mobile_hide{display:none}.row-content{width:100%!important}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
                            </style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]--></head><body class="body" style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff"><tbody><tr><td><table class="row row-1" align="center" 
                            width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:20px;padding-top:30px;vertical-align:top"><table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad" style="width:100%;padding-right:0;padding-left:0"><div class="alignment" align="center"><div style="max-width:35px">
                            <a href="https://www.enginemailer.com" target="_blank"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/r388/l239mmxz/eg3/c72/f97/favicon_4.png" style="display:block;height:auto;border:0;width:100%" width="35" alt="Enginemailer logo" title="Enginemailer logo" height="auto"></a></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" 
                            role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table 
                            class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad" style="width:100%"><div class="alignment" align="center"><div style="max-width:700px"><img src="https://d15k2d11r6t6rl.cloudfront.net/pub/r388/l239mmxz/kmw/eq6/1x9/EmailHeading.png" style="display:block;height:auto;border:0;width:100%" width="700" alt title height="auto"></div></div></td></tr></table></td></tr></tbody></table>
                            </td></tr></tbody></table><table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="font-family:sans-serif"><div class 
                            style="font-size:14px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;mso-line-height-alt:16.8px;color:#555;line-height:1.2"><p style="margin:0;font-size:14px;mso-line-height-alt:16.8px"><strong><span style="word-break: break-word; font-size: 24px;">Hi <span style="word-break: break-word; color: #106552;">' . $user->name . '</span>,</span></strong></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-4" align="center" width="100%" border="0" 
                            cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div 
                            style="color:#000;direction:ltr;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0;line-height:1.2;text-align:left;mso-line-height-alt:17px"><p style="margin:0;margin-bottom:16px">Here is your One Time Password (OTP)</p><p style="margin:0">Please enter this code to verify your email address for Premium Corporate Solutions.</p></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-5" align="center" 
                            width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="font-family:sans-serif"><div class 
                            style="font-size:14px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;mso-line-height-alt:16.8px;color:#555;line-height:1.2"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:16.8px"><span style="word-break: break-word; font-size: 46px;">' . $otp . '</span></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" 
                            style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table 
                            class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="color:#000;direction:ltr;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0;line-height:1.2;text-align:left;mso-line-height-alt:17px"><p style="margin:0">OTP will expire in <strong>24 Hours</strong>.</p></div></td></tr></table></td></tr>
                            </tbody></table></td></tr></tbody></table><table class="row row-7" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-radius:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top"><table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div 
                            style="color:#000;direction:ltr;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0;line-height:1.2;text-align:left;mso-line-height-alt:17px"><p style="margin:0;margin-bottom:16px">Best Regards,</p><p style="margin:0"><strong><span style="word-break: break-word; color: #9a2b60;">Premium Corporate Solutions</span></strong></p></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-8" align="center" 
                            width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px;margin:0 auto" width="700"><tbody><tr><td class="column column-1" width="100%" 
                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-bottom:25px;padding-top:25px;vertical-align:top"><table class="divider_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad"><div class="alignment" align="center"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td 
                            class="divider_inner" style="font-size:1px;line-height:1px;border-top:1px solid #bbb"><span style="word-break: break-word;">&#8202;</span></td></tr></table></div></td></tr></table><table class="social_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad"><div class="alignment" align="center"><table class="social-table" width="156px" border="0" cellpadding="0" cellspacing="0" 
                            role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block"><tr><td style="padding:0 10px 0 10px"><a href="https://www.facebook.com/premiumcorporatesolutions" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-dark-gray/facebook@2x.png" width="32" height="auto" alt="Facebook" title="Facebook" style="display:block;height:auto;border:0"></a></td><td style="padding:0 10px 0 10px">
                            <a href="https://www.instagram.com/premiumcorpsolutions" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-dark-gray/instagram@2x.png" width="32" height="auto" alt="Instagram" title="Instagram" style="display:block;height:auto;border:0"></a></td><td style="padding:0 10px 0 10px"><a href="https://www.linkedin.com/company/premium-corporate-solutions" target="_blank"><img 
                            src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-dark-gray/linkedin@2x.png" width="32" height="auto" alt="LinkedIn" title="LinkedIn" style="display:block;height:auto;border:0"></a></td></tr></table></div></td></tr></table><table class="divider_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad"><div class="alignment" align="center"><table border="0" 
                            cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="divider_inner" style="font-size:1px;line-height:1px;border-top:1px solid #bbb"><span style="word-break: break-word;">&#8202;</span></td></tr></table></div></td></tr></table><table class="text_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad">
                            <div style="font-family:sans-serif"><div class style="font-size:12px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:16.8px">© 2025 Premium Corporate Solutions. All Rights Reserved.</p></div></div></td></tr></table><table class="text_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" 
                            style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="font-family:sans-serif"><div class style="font-size:14px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;mso-line-height-alt:16.8px;color:#555;line-height:1.2"><p style="margin:0;text-align:center;mso-line-height-alt:16.8px">You are receiving this email because you registered to join Premium Corporate Solutions platform as a user.</p><p 
                            style="margin:0;text-align:center;mso-line-height-alt:16.8px">This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to</p><p style="margin:0;text-align:center;mso-line-height-alt:16.8px">receive mails from use, please click the unsubscribe link below to unsubscribe</p></div></div></td></tr></table><table class="text_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" 
                            style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad" style="padding-bottom:20px;padding-left:10px;padding-right:10px;padding-top:20px"><div style="font-family:sans-serif"><div class style="font-size:12px;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:16.8px">
                            <span style="word-break: break-word; font-size: 12px;"><a href="https://www.premiumcorpsolutions.com/privacy" target="_blank" style="text-decoration: underline; color: #555555;" rel="noopener">Privacy Policy</a> &nbsp; &nbsp;· &nbsp; &nbsp;<a href="https://www.premiumcorpsolutions.com/terms" target="_blank" style="text-decoration: underline; color: #555555;" rel="noopener">Terms of Service</a><a href="http://[updateprofile]/" target="_blank" rel="noopener" style="text-decoration: underline; color: #555555;"></a>     ·    <a href="test" target="_blank" style="text-decoration: underline; color: #555555;" rel="noopener">Help Center</a><a href="http://[updateprofile]/" target="_blank" rel="noopener" style="text-decoration: underline; color: #555555;"></a>     ·    <a href="ts" target="_blank" style="text-decoration: underline; color: #555555;" rel="noopener">Unsubscribe </a> </span></p></div></div></td></tr></table></td>
                            </tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!-- End --><div style="background-color:transparent;">
                                <div style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid ">
                                    <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 500px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
                                        <!--[if (mso)|(IE)]><td align="center" width="500" style=" width:500px; padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:15px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                        <div class="col num12" style="min-width: 320px;max-width: 500px;display: table-cell;vertical-align: top;">
                                            <div style="background-color: transparent; width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!--><div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 0px; padding-left: 0px;">
                                                    <!--<![endif]-->
                                                    <!--[if (!mso)&(!IE)]><!-->
                                                </div><!--<![endif]-->
                                            </div>
                                        </div>
                                        <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                    </div>
                                </div>
                            </div></body></html>'
                        );
                });
                \Log::info('OTP email sent successfully to: ' . $user->email);
            } catch (\Exception $e) {
                \Log::error('Failed to send OTP email: ' . $e->getMessage());
                // Continue with registration even if email fails
            }

            UserStageItemService::initializeFor($user);

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

    public function addcan(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'sometimes|integer|exists:roles,id',
        ]);

        try {
            // Generate OTP (6 digits)
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['name'],
                'password' => Hash::make('password'),
                'role_id' => $validated['role_id'] ?? 2, // Default role ID (2 for regular users)
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]);

            UserStageItemService::initializeForNewCandidate($user);

            // Use $user->id instead of $userId
            ComplianceUser::updateOrCreate(
                ['user_id' => $user->id],
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

            AdminActivityLogger::log(
                'candidate_added',
                "Added new candidate {$user->name} ({$user->email})",
                $user
            );

            // Return success response
            return response()->json([
                'message' => 'Adding Candidate Successful, You/They can complete their Profile now.',
                'user' => $user->only(['id', 'name', 'email', 'username']),
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

            // Create new token with role information
            $token = $user->createToken('auth_token', ['role:' . $user->role->name])->plainTextToken;

            // Also establish a session so routes that check the default web
            // guard (e.g. Auth::id() for admin activity logging) resolve
            // the current user, not just token-gated routes.
            Auth::login($user);

            return response()->json([
                'message' => 'Login successful',
                'user' => array_merge($user->only(['id', 'name', 'email', 'username', 'role_id']), [
                    'role' => [
                        'id' => $user->role->id,
                        'name' => $user->role->name
                    ]
                ]),
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
            // Revoke Sanctum tokens
            $request->user()->tokens()->delete();

            // Log out of session
            Auth::logout();

            // Invalidate the session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

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
        $user = $request->user()->load('role'); // make sure role relationship is loaded

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role_id' => $user->role_id,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name
                ] : null
            ]
        ]);
    }

    /**
     * Admin-only: list all admin accounts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listAdmins(Request $request)
    {
        $adminRole = Role::where('name', 'Admin')->first();

        $admins = User::where('role_id', $adminRole?->id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'username', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $admins,
        ]);
    }

    /**
     * Admin-only: create a new admin account. Generates a temporary
     * password that is returned once so the creating admin can share it.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAdminAccount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
        ]);

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        $temporaryPassword = Str::random(4) . '-' . Str::random(4) . '-' . random_int(10, 99);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($temporaryPassword),
            'role_id' => $adminRole->id,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        AdminActivityLogger::log(
            'admin_account_created',
            "Created new admin account for {$admin->name} ({$admin->email})",
            $admin
        );

        return response()->json([
            'message' => 'Admin account created successfully. Share the temporary password securely - it will not be shown again.',
            'user' => $admin->only(['id', 'name', 'email', 'username']),
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    /**
     * Admin-only: reset another admin's password. Admin accounts have no
     * UserInformation record, so they can't go through the regular
     * PasswordResetController flow - this generates a fresh temporary
     * password and returns it once.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetAdminPassword(Request $request, $id)
    {
        $adminRole = Role::where('name', 'Admin')->first();
        $admin = User::where('id', $id)->where('role_id', $adminRole?->id)->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found',
            ], 404);
        }

        $temporaryPassword = Str::random(4) . '-' . Str::random(4) . '-' . random_int(10, 99);

        $admin->password = Hash::make($temporaryPassword);
        $admin->save();

        AdminActivityLogger::log(
            'admin_password_reset',
            "Reset password for admin {$admin->name} ({$admin->email})",
            $admin
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. Share it securely - it will not be shown again.',
            'temporary_password' => $temporaryPassword,
        ]);
    }
}
