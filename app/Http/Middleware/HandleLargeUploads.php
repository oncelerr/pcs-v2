<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Exceptions\PostTooLargeException;

class HandleLargeUploads
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
        // Check if the request is likely to be a file upload
        if ($request->isMethod('post') && $request->hasHeader('Content-Type') && 
            strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
            
            try {
                // Try to process the request normally
                return $next($request);
            } catch (PostTooLargeException $e) {
                // If we catch a PostTooLargeException, return a more user-friendly response
                return response()->json([
                    'message' => 'The uploaded file is too large. Maximum allowed size is 4MB.',
                    'error' => 'file_too_large',
                    'max_size' => '4MB'
                ], 413); // 413 Payload Too Large
            }
        }
        
        return $next($request);
    }
}
