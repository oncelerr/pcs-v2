<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSuperAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $user = $request->user()->load('role');

        $isSuperAdmin = $user->role && $user->role->name === 'Super Admin';

        if (!$isSuperAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
