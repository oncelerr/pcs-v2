<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    /**
     * Reset a user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request, $id)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Find the user information record first
            $userInfo = UserInformation::find($id);
            
            if (!$userInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'User information not found'
                ], 404);
            }
            
            // Get the associated user
            $user = User::find($userInfo->user_id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Associated user account not found'
                ], 404);
            }
            
            // Update the password
            $user->password = Hash::make($request->password);
            $user->save();
            
            // Log the password reset with more details
            Log::info("Password reset successful", [
                'user_information_id' => $id,
                'user_id' => $userInfo->user_id,
                'email' => $user->email
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to reset password: {$e->getMessage()}");
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change the authenticated user's own password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeOwnPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            Log::info("User changed own password", [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to change password: {$e->getMessage()}");

            return response()->json([
                'success' => false,
                'message' => 'Failed to change password. Please try again.'
            ], 500);
        }
    }
}
