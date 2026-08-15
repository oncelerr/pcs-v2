<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class AdminActivityLogger
{
    /**
     * Record an admin action. Never throws - logging failures must not
     * break the action that triggered them.
     *
     * @param  string  $action  Short machine-readable key, e.g. "document_upload"
     * @param  string  $description  Human-readable summary
     * @param  Model|null  $subject  The record the action was performed on, if any
     * @param  array  $metadata  Extra structured context
     * @param  int|null  $adminId  Defaults to the currently authenticated user
     */
    public static function log(
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = [],
        ?int $adminId = null
    ): void {
        try {
            $resolvedAdminId = $adminId ?? Auth::id() ?? self::resolveAdminIdFromBearerToken();

            if (!$resolvedAdminId) {
                Log::warning('Skipped admin activity log: no authenticated admin found', ['action' => $action]);
                return;
            }

            AdminActivityLog::create([
                'admin_id' => $resolvedAdminId,
                'action' => $action,
                'description' => $description,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id' => $subject?->getKey(),
                'metadata' => $metadata ?: null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to record admin activity log', [
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Fallback for routes that aren't behind the auth:sanctum middleware
     * (and so have no session-based Auth::id()) but still carry a bearer
     * token, e.g. calls made with an Authorization header but no cookie.
     */
    private static function resolveAdminIdFromBearerToken(): ?int
    {
        $token = request()?->bearerToken();

        if (!$token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        return $accessToken?->tokenable_id;
    }
}
