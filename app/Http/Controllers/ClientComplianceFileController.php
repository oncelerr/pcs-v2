<?php

namespace App\Http\Controllers;

use App\Models\ClientComplianceFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClientComplianceFileController extends Controller
{
    /**
     * Store a newly created compliance file in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'file_name' => 'required|string',
            'column_for' => 'required|string',
            'naming' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $clientComplianceFile = ClientComplianceFile::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Compliance file record created successfully',
            'data' => $clientComplianceFile
        ], 201);
    }

    /**
     * Get all compliance files for a specific user.
     *
     * @param  int  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByUser($userId)
    {
        $files = ClientComplianceFile::where('user_id', $userId)->get();
        
        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }

    /**
     * Get all compliance files for a specific column.
     *
     * @param  int  $userId
     * @param  string  $column
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByColumn($userId, $column)
    {
        $files = ClientComplianceFile::where('user_id', $userId)
            ->where('column_for', $column)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }
}
