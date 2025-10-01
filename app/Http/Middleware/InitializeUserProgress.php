<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InitializeUserProgress
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // Check if user is authenticated and has no stage items
        if ($user && $user->stageItems()->count() === 0) {
            try {
                Log::info('Initializing progress for existing user: ' . $user->id);
                $user->initializeProgress();
            } catch (\Exception $e) {
                Log::error('Failed to initialize user progress: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
