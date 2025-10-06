<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileAccessController extends Controller
{
    /**
     * Get a file from private storage
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $type
     * @param  int  $userId
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function getFile(Request $request, $type, $userId)
    {
        // Authentication check temporarily disabled for testing
        // if (!Auth::check()) {
        //     return response()->json(['error' => 'Unauthorized'], 401);
        // }

        // Only allow specific file types
        if (!in_array($type, ['passport', 'proof_address', 'signature'])) {
            return response()->json(['error' => 'Invalid file type'], 400);
        }

        // Use the exact path specified
        $directory = 'app/private/public/client_upload';
        
        // Check if directory exists
        if (!Storage::exists($directory)) {
            return response()->json([
                'error' => 'Storage directory not found',
                'directory' => $directory,
                'storage_path' => storage_path($directory)
            ], 500);
        }
        
        // Use the exact naming convention
        // The files are stored as passport_{userId}.fileType, proof_address_{userId}.fileType, etc.
        $pattern = "{$directory}/{$type}_{$userId}.*";
        $files = Storage::files($directory);
        $filePath = null;
        
        foreach ($files as $file) {
            // Check if the file matches our pattern
            if (fnmatch($pattern, $file)) {
                $filePath = $file;
                break;
            }
        }
        
        if (!$filePath || !Storage::exists($filePath)) {
            // Log debugging information
            \Log::info('File not found', [
                'userId' => $userId,
                'type' => $type,
                'pattern' => $pattern,
                'available_files' => $files,
                'directory_exists' => Storage::exists($directory)
            ]);
            
            return response()->json([
                'error' => 'File not found',
                'debug' => [
                    'userId' => $userId,
                    'type' => $type,
                    'pattern' => $pattern,
                    'directory' => $directory,
                    'directory_exists' => Storage::exists($directory),
                    'available_files_count' => count($files)
                ]
            ], 404);
        }

        // Get file mime type
        $mimeType = Storage::mimeType($filePath);
        
        // Log successful file access
        \Log::info('File access successful', [
            'userId' => $userId,
            'type' => $type,
            'filePath' => $filePath,
            'mimeType' => $mimeType
        ]);
        
        // Return the file as a download or inline display
        return Storage::response($filePath, "{$type}_{$userId}", [
            'Content-Type' => $mimeType,
            'Content-Disposition' => $request->query('download') === 'true' 
                ? 'attachment' 
                : 'inline',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
