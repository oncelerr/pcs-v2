<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class DirectFileController extends Controller
{
    /**
     * Get a file directly from the storage path
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $type
     * @param  int  $userId
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function getFile(Request $request, $type, $userId)
    {
        // Only allow specific file types
        if (!in_array($type, ['passport', 'proof_address', 'signature'])) {
            return response()->json(['error' => 'Invalid file type'], 400);
        }

        // Define the storage directory path
        $storagePath = storage_path('app/private/public/client_upload');
        
        // Check if directory exists
        if (!File::isDirectory($storagePath)) {
            return response()->json([
                'error' => 'Storage directory not found',
                'path' => $storagePath
            ], 404);
        }
        
        // Get all files in the directory
        $files = File::files($storagePath);
        $targetFile = null;
        
        // Find the file with the matching pattern
        foreach ($files as $file) {
            $filename = $file->getFilename();
            if (preg_match("/^{$type}_{$userId}\./", $filename)) {
                $targetFile = $file;
                break;
            }
        }
        
        // If file not found
        if (!$targetFile) {
            return response()->json([
                'error' => 'File not found',
                'type' => $type,
                'userId' => $userId,
                'directory' => $storagePath,
                'files' => array_map(function($file) {
                    return $file->getFilename();
                }, $files)
            ], 404);
        }
        
        // Log successful file access
        \Log::info('Direct file access successful', [
            'userId' => $userId,
            'type' => $type,
            'filePath' => $targetFile->getPathname(),
            'filename' => $targetFile->getFilename()
        ]);
        
        // Determine content type
        $contentType = $this->getContentType($targetFile->getExtension());
        
        // Return the file
        return Response::file($targetFile->getPathname(), [
            'Content-Type' => $contentType,
            'Content-Disposition' => $request->query('download') === 'true' 
                ? 'attachment; filename="' . $targetFile->getFilename() . '"' 
                : 'inline',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
    
    /**
     * Get content type based on file extension
     *
     * @param  string  $extension
     * @return string
     */
    private function getContentType($extension)
    {
        $contentTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
            'svg' => 'image/svg+xml',
        ];
        
        return $contentTypes[strtolower($extension)] ?? 'application/octet-stream';
    }
}
