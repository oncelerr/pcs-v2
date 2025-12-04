<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\ClientComplianceFile;
use App\Models\User;

class UserDocumentController extends Controller
{
    // No constructor needed - middleware is applied in the routes file
    
    /**
     * Get all user documents with pagination and filtering
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Check if user is admin
        $user = Auth::user();
        if (!$user || !$user->hasRole('Admin')) {
            return response()->json(['error' => 'Unauthorized', 'message' => 'Admin role required'], 403);
        }

        // Get query parameters
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $documentType = $request->input('document_type', '');

        // Build query using the ClientComplianceFile model
        $query = ClientComplianceFile::query()
            ->join('users', 'client_compliance_files.user_id', '=', 'users.id')
            ->leftJoin('user_information', 'users.id', '=', 'user_information.user_id')
            ->select(
                'client_compliance_files.id',
                'client_compliance_files.user_id',
                'user_information.company_name',
                'client_compliance_files.column_for as document_type',
                'client_compliance_files.file_name',
                'client_compliance_files.file_name as file_path', // Using file_name as path since that's what we have
                'client_compliance_files.created_at as uploaded_at',
                'users.name as uploaded_by'
            );

        // Apply search filter
        if ($search) {
            $query->where('user_information.company_name', 'LIKE', "%{$search}%");
        }

        // Apply document type filter
        if ($documentType) {
            $query->where('client_compliance_files.column_for', $documentType);
        }

        // Get paginated results
        $documents = $query->orderBy('client_compliance_files.created_at', 'desc')
                          ->paginate($perPage);
        
        // Add proper file paths
        $documents->getCollection()->transform(function ($document) {
            $document->file_path = 'compliance_documents/client_' . $document->user_id . '/' . $document->file_name;
            return $document;
        });

        return response()->json($documents);
    }

    /**
     * Get a specific document
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Check if user is admin
        $user = Auth::user();
        if (!$user || !$user->hasRole('Admin')) {
            return response()->json(['error' => 'Unauthorized', 'message' => 'Admin role required'], 403);
        }

        $document = ClientComplianceFile::query()
            ->join('users', 'client_compliance_files.user_id', '=', 'users.id')
            ->leftJoin('user_information', 'users.id', '=', 'user_information.user_id')
            ->select(
                'client_compliance_files.id',
                'client_compliance_files.user_id',
                'user_information.company_name',
                'client_compliance_files.column_for as document_type',
                'client_compliance_files.file_name',
                'client_compliance_files.created_at as uploaded_at',
                'users.name as uploaded_by'
            )
            ->where('client_compliance_files.id', $id)
            ->first();
            
        if ($document) {
            // Add proper file path
            $document->file_path = 'compliance_documents/client_' . $document->user_id . '/' . $document->file_name;
        }

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        return response()->json($document);
    }

    /**
     * Get documents for a specific user
     *
     * @param  int  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserDocuments($userId)
    {
        // Check if user is admin or the owner of the documents
        $user = Auth::user();
        if (!$user || (!$user->hasRole('Admin') && $user->id != $userId)) {
            return response()->json(['error' => 'Unauthorized', 'message' => 'Admin role or document ownership required'], 403);
        }

        $documents = ClientComplianceFile::query()
            ->join('users', 'client_compliance_files.user_id', '=', 'users.id')
            ->leftJoin('user_information', 'users.id', '=', 'user_information.user_id')
            ->select(
                'client_compliance_files.id',
                'client_compliance_files.user_id',
                'user_information.company_name',
                'client_compliance_files.column_for as document_type',
                'client_compliance_files.file_name',
                'client_compliance_files.created_at as uploaded_at',
                'users.name as uploaded_by'
            )
            ->where('client_compliance_files.user_id', $userId)
            ->orderBy('client_compliance_files.created_at', 'desc')
            ->get();
            
        // Add proper file paths
        $documents->transform(function ($document) {
            $document->file_path = 'compliance_documents/client_' . $document->user_id . '/' . $document->file_name;
            return $document;
        });

        return response()->json(['data' => $documents]);
    }
}
