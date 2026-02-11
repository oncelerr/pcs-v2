<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class NotificationController extends Controller
{
    /**
     * 📩 Send a notification to a specific user
     */
    public function sendToUser(int $userId, string $title, string $message, array $options = []): Notification
    {
        try {
            return Notification::create([
                'user_id'    => $userId,
                'title'      => $title,
                'message'    => $message,
                'type'       => $options['type'] ?? null,
                'data'       => $options['data'] ?? null,
                'action_url' => $options['action_url'] ?? null,
                'status'     => $options['status'] ?? 'sent',
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send notification', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * 📢 Send a notification to all users
     */
    public function sendToAllUsers(string $title, string $message, array $options = []): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $this->sendToUser($user->id, $title, $message, $options);
        }
    }

    /**
     * 👑 Send a notification to all admin users (role = 1)
     */
    public function notifyAdmins(string $title, string $message, array $options = []): void
    {
        // Get all admin users (role_id = 1)
        $admins = User::where('role_id', 1)->get();

        foreach ($admins as $admin) {
            $this->sendToUser($admin->id, $title, $message, array_merge($options, [
                'type' => $options['type'] ?? 'admin_log'
            ]));
        }
        
        // Send email notification to the email address specified in MAIL_ADMIN_NOTIF env variable
        try {
            $notificationEmail = env('MAIL_ADMIN_NOTIF', 'filings@premiumcorpsolutions.com');
            
            if ($notificationEmail) {
                Mail::send([], [], function ($mailMessage) use ($notificationEmail, $title, $message, $options) {
                    $mailMessage->to($notificationEmail)
                        ->subject("[Admin Notification] $title")
                        ->html(
                            "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;'>"
                            . "<h2 style='color: #106552;'>$title</h2>"
                            . "<p style='font-size: 16px; line-height: 1.5;'>$message</p>"
                            . (isset($options['data']) ? $this->formatAdditionalInfo($options['data']) : "")
                            . "<p style='margin-top: 30px; font-size: 12px; color: #777;'>This is an automated notification from Premium Corp Solutions.</p>"
                            . "</div>"
                        );
                });
                
                Log::info("Email notification sent to $notificationEmail", ['title' => $title]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email notification", [
                'error' => $e->getMessage(),
                'title' => $title
            ]);
        }

        // Also log this in Laravel log file for auditing
        Log::channel('daily')->info("[ADMIN NOTIFICATION] $title - $message", $options);
    }

    /**
     * Format additional information in a human-readable table format
     */
    private function formatAdditionalInfo(array $data): string
    {
        $html = "<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;'>";
        $html .= "<h3 style='margin-top: 0; color: #106552;'>Request Details</h3>";
        $html .= "<table style='width: 100%; border-collapse: collapse;'>";
        
        foreach ($data as $key => $value) {
            // Convert snake_case to Title Case
            $label = ucwords(str_replace('_', ' ', $key));
            
            // Format the value
            $formattedValue = $this->formatValue($value);
            
            $html .= "<tr style='border-bottom: 1px solid #ddd;'>";
            $html .= "<td style='padding: 10px 5px; font-weight: bold; color: #555; width: 40%;'>$label:</td>";
            $html .= "<td style='padding: 10px 5px; color: #333;'>$formattedValue</td>";
            $html .= "</tr>";
        }
        
        $html .= "</table>";
        $html .= "</div>";
        
        return $html;
    }

    /**
     * Format individual values for display
     */
    private function formatValue($value): string
    {
        if (is_array($value)) {
            return implode(', ', $value);
        }
        
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }
        
        if (is_null($value)) {
            return 'N/A';
        }
        
        return htmlspecialchars((string) $value);
    }

    /**
     * 🧠 Log system events and alert admins
     */
    public function logSystemEvent(string $eventName, string $details, array $context = []): void
    {
        // Save a DB record for admins
        $this->notifyAdmins("System Event: $eventName", $details, [
            'data' => $context,
            'status' => 'logged',
        ]);

        // Also log to file for deeper audit
        Log::channel('daily')->info("[SYSTEM EVENT] $eventName", [
            'details' => $details,
            'context' => $context,
        ]);
    }

    /**
     * 📬 Get all notifications for a user
     */
    public function getUserNotifications(int $userId)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * ✅ Mark a notification as read
     */
    public function markAsRead(int $notificationId)
    {
        $notification = Notification::findOrFail($notificationId);
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * 🚮 Delete a notification
     */
    public function deleteNotification(int $notificationId)
    {
        $notification = Notification::findOrFail($notificationId);
        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
    
    /**
     * ✅ Mark all notifications as read for a user
     */
    public function markAllAsRead(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);
        
        $userId = $validated['user_id'];
        
        // Update all unread notifications for this user
        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            
        return response()->json([
            'message' => 'All notifications marked as read',
            'success' => true
        ]);
    }
}