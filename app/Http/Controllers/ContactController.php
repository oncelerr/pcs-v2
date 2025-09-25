<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $recipient = env('MAIL_FROM_ADDRESS');
            
            if (empty($recipient)) {
                throw new \Exception('Recipient email address is not configured');
            }
            
            // Send email to admin
            Mail::to($recipient)
                ->send(new ContactFormMail(
                    $request->firstname,
                    $request->lastname,
                    $request->email,
                    $request->message
                ));

            // Check if the email was actually sent
            if (count(Mail::failures()) > 0) {
                throw new \Exception('Failed to send email. Please try again later.');
            }

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ]);
        } catch (\Exception $e) {
            \Log::error('Contact form error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.'
            ], 500);
        }
    }
}
