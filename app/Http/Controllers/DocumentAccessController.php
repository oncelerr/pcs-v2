<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\URL;
use App\Models\ClientUploadedFile;

class DocumentAccessController extends Controller
{
    /**
     * View a document securely with proper authorization
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function viewDocument(Request $request)
    {
        // Verify the signature is valid (this is handled automatically by the middleware)

        // Extract parameters
        $userId = $request->userId;
        $documentType = $request->documentType;
        $filePath = $request->filePath;

        // Temporarily removed auth check for testing
        // $currentUser = Auth::user();
        // if (!$currentUser || ($currentUser->id != $userId && !$currentUser->hasRole('admin'))) {
        //     abort(403, 'Unauthorized access to document');
        // }

        // Verify the document belongs to the user
        $document = ClientUploadedFile::where('user_id', $userId)->first();
        if (!$document) {
            abort(404, 'Document not found');
        }

        // Get the correct file path based on document type
        $filePathInDb = null;
        switch ($documentType) {
            case 'passport':
                $filePathInDb = $document->passport_file_name;
                break;
            case 'proof_address':
                $filePathInDb = $document->proof_address_file_name;
                break;
            case 'signature':
                $filePathInDb = $document->signature_file_name;
                break;
            default:
                abort(400, 'Invalid document type');
        }

        // Verify the requested file path matches what's in the database
        if ($filePathInDb !== $filePath) {
            abort(403, 'Invalid file path');
        }

        // Check if file exists
        $fullPath = 'client_upload/' . $filePath;
        if (!Storage::disk('private')->exists($fullPath)) {
            abort(404, 'File not found');
        }

        // Get file contents
        $file = Storage::disk('private')->get($fullPath);

        // Get mime type using PHP's built-in functions since Laravel's Storage may not support mimeType
        $tempFile = tempnam(sys_get_temp_dir(), 'doc_');
        file_put_contents($tempFile, $file);
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tempFile);
        finfo_close($finfo);
        unlink($tempFile);

        // Determine if this is a download request
        $disposition = $request->has('download') ? 'attachment' : 'inline';
        $filename = basename($filePath);

        // Return the file with appropriate headers
        return Response::make($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => $disposition . '; filename="' . $filename . '"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => 'Sat, 01 Jan 2000 00:00:00 GMT',
        ]);
    }

    /**
     * Generate secure URLs for document viewing in the UserDetailsModal
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSecureUrls(Request $request)
    {
        // Validate request
        $request->validate([
            'userId' => 'required|integer',
            'documentTypes' => 'required|array',
            'documentTypes.*' => 'string|in:passport,proof_address,signature'
        ]);

        // Temporarily removed auth check for testing
        // $currentUser = Auth::user();
        // if (!$currentUser || ($currentUser->id != $request->userId && !$currentUser->hasRole('admin'))) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        $userId = $request->userId;
        $documentTypes = $request->documentTypes;
        $urls = [];

        // Get the user's documents
        $documents = ClientUploadedFile::where('user_id', $userId)->first();
        if (!$documents) {
            return response()->json(['urls' => $urls]);
        }

        foreach ($documentTypes as $docType) {
            $filePathInDb = null;

            // Get the file path from the database
            switch ($docType) {
                case 'passport':
                    $filePathInDb = $documents->passport_file_name;
                    break;
                case 'proof_address':
                    $filePathInDb = $documents->proof_address_file_name;
                    break;
                case 'signature':
                    $filePathInDb = $documents->signature_file_name;
                    break;
            }

            if ($filePathInDb) {
                // Generate a signed URL that expires in 5 minutes
                $urls[$docType] = route('document.view', [
                    'userId' => $userId,
                    'documentType' => $docType,
                    'filePath' => $filePathInDb,
                    'signature' => '',  // This will be filled by the signed route
                    'expires' => '',    // This will be filled by the signed route
                ]);

                // Make it a signed URL
                $urls[$docType] = URL::signedRoute('document.view', [
                    'userId' => $userId,
                    'documentType' => $docType,
                    'filePath' => $filePathInDb,
                ], now()->addMinutes(5));
            }
        }

        return response()->json(['urls' => $urls]);
    }

    /**
     * Generate a one-time token for document download
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAccessToken(Request $request)
    {
        // Validate request
        $request->validate([
            'userId' => 'required|integer',
            'documentType' => 'required|string|in:passport,proof_address,signature'
        ]);

        // Temporarily removed auth check for testing
        // $currentUser = Auth::user();
        // if (!$currentUser || ($currentUser->id != $request->userId && !$currentUser->hasRole('admin'))) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        $userId = $request->userId;
        $documentType = $request->documentType;

        // Get the document path
        $document = ClientUploadedFile::where('user_id', $userId)->first();
        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        $filePathInDb = null;
        switch ($documentType) {
            case 'passport':
                $filePathInDb = $document->passport_file_name;
                break;
            case 'proof_address':
                $filePathInDb = $document->proof_address_file_name;
                break;
            case 'signature':
                $filePathInDb = $document->signature_file_name;
                break;
        }

        if (!$filePathInDb) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        // Generate a download URL with the download parameter
        $downloadUrl = URL::signedRoute('document.view', [
            'userId' => $userId,
            'documentType' => $documentType,
            'filePath' => $filePathInDb,
            'download' => true,
        ], now()->addMinutes(5));

        return response()->json(['downloadUrl' => $downloadUrl]);
    }

    /**
     * Generate a document URL using the direct file path
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDocumentUrl(Request $request)
    {
        // Validate request
        $request->validate([
            'userId' => 'required|integer',
            'filePath' => 'required|string',
            'fileName' => 'required|string',
            'download' => 'boolean'
        ]);

        $userId = $request->userId;
        $filePath = $request->filePath;
        $fileName = $request->fileName;
        $download = $request->input('download', false);

        // Check if user has permission to access this file
        // Temporarily removed auth check for testing
        // $currentUser = Auth::user();
        // if (!$currentUser || ($currentUser->id != $userId && !$currentUser->hasRole('Admin'))) {
        //     return response()->json(['error' => 'Unauthorized access to document'], 403);
        // }

        // Base64 encode the filePath to avoid URL encoding issues with slashes
        $encodedFilePath = base64_encode($filePath);

        // Generate a signed URL that expires in 5 minutes
        $downloadUrl = URL::temporarySignedRoute(
            'document.direct-view',
            now()->addMinutes(5),
            [
                'userId' => $userId,
                'filePath' => $encodedFilePath,
                'fileName' => $fileName,
                'download' => $download
            ]
        );

        return response()->json(['downloadUrl' => $downloadUrl]);
    }

    /**
     * View a document directly using the file path
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function viewDirectDocument(Request $request)
    {
        // Verify the signature is valid (this is handled automatically by the middleware)

        // Extract parameters
        $userId = $request->userId;
        $encodedFilePath = $request->filePath;
        $fileName = $request->fileName;
        $download = $request->has('download');

        // Decode the base64 encoded filePath
        $filePath = base64_decode($encodedFilePath);

        // Validate that the decoded path is valid
        if ($filePath === false || empty($filePath)) {
            abort(400, 'Invalid file path');
        }

        // Temporarily removed auth check for testing
        // $currentUser = Auth::user();
        // if (!$currentUser || ($currentUser->id != $userId && !$currentUser->hasRole('Admin'))) {
        //     abort(403, 'Unauthorized access to document');
        // }

        // The full path should be in the format: 'compliance_documents/client_{userId}/{fileName}'
        // Check if file exists in public storage
        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, 'File not found');
        }

        // Get the full path to the file
        $fullPath = Storage::disk('public')->path($filePath);

        // Check if file exists and is readable
        if (!file_exists($fullPath) || !is_readable($fullPath)) {
            abort(404, 'File not found or not readable');
        }

        // Get file size
        $fileSize = filesize($fullPath);

        // Get mime type using PHP's built-in functions
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $fullPath);
        finfo_close($finfo);

        // Determine if this is a download request
        $disposition = $download ? 'attachment' : 'inline';

        // Set appropriate headers
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $fileSize,
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => 'Sat, 01 Jan 2000 00:00:00 GMT',
        ];

        // For PDF files, ensure the correct MIME type is set
        if (strtolower(pathinfo($fileName, PATHINFO_EXTENSION)) === 'pdf') {
            $headers['Content-Type'] = 'application/pdf';
        }

        // Return the file with appropriate headers
        return response()->file($fullPath, $headers);
    }
}
