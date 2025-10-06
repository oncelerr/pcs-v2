<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserInformationController extends Controller
{
    /**
     * Display a paginated listing of user information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Default pagination parameters
        $perPage = $request->input('per_page', 10); // Default to 10 items per page
        $page = $request->input('page', 1);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Validate pagination parameters
        $validator = Validator::make([
            'per_page' => $perPage,
            'page' => $page,
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder
        ], [
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort_by' => 'string|in:id,first_name,last_name,company_name,created_at',
            'sort_order' => 'string|in:asc,desc'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid pagination parameters',
                'errors' => $validator->errors()
            ], 400);
        }
        
        // Build the query with filters
        $query = UserInformation::query();
        
        // Apply search filter if provided
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('company_name', 'like', "%{$searchTerm}%")
                  ->orWhere('email_address', 'like', "%{$searchTerm}%");
            });
        }
        
        // Apply company type filter if provided
        if ($request->has('company_type')) {
            $query->where('company_type', $request->input('company_type'));
        }
        
        // Apply state registration filter if provided
        if ($request->has('state_registration')) {
            $query->where('state_registration', $request->input('state_registration'));
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);
        
        // Execute the query with pagination
        $userInformation = $query->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'success' => true,
            'data' => $userInformation->items(),
            'pagination' => [
                'total' => $userInformation->total(),
                'per_page' => $userInformation->perPage(),
                'current_page' => $userInformation->currentPage(),
                'last_page' => $userInformation->lastPage(),
                'from' => $userInformation->firstItem(),
                'to' => $userInformation->lastItem(),
            ]
        ]);
    }

    /**
     * Display the specified user information.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $userInformation = UserInformation::find($id);
        
        if (!$userInformation) {
            return response()->json([
                'success' => false,
                'message' => 'User information not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $userInformation
        ]);
    }

    /**
     * Store a newly created user information in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email_address' => 'required|email|max:255',
            'contact_number' => 'required|string|max:20',
            'company_name' => 'required|string|max:255',
            // Add other validation rules as needed
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Add user_id from authenticated user if not provided
        if (!$request->has('user_id') && Auth::check()) {
            $request->merge(['user_id' => Auth::id()]);
        }
        
        $userInformation = UserInformation::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'User information created successfully',
            'data' => $userInformation
        ], 201);
    }

    /**
     * Update the specified user information in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $userInformation = UserInformation::find($id);
        
        if (!$userInformation) {
            return response()->json([
                'success' => false,
                'message' => 'User information not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255',
            'email_address' => 'email|max:255',
            'contact_number' => 'string|max:20',
            'company_name' => 'string|max:255',
            // Add other validation rules as needed
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userInformation->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'User information updated successfully',
            'data' => $userInformation
        ]);
    }

    /**
     * Remove the specified user information and all related data from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $userInformation = UserInformation::find($id);
        
        if (!$userInformation) {
            return response()->json([
                'success' => false,
                'message' => 'User information not found'
            ], 404);
        }
        
        // Get the associated user ID
        $userId = $userInformation->user_id;
        
        // Begin a database transaction to ensure all or nothing deletion
        DB::beginTransaction();
        
        try {
            // Delete all related records in various tables
            // The order matters to avoid foreign key constraint violations
            
            // 1. Delete user information
            $userInformation->delete();
            Log::info("Deleted user information for user ID: {$userId}");
            
            // 2. Find the user
            $user = User::find($userId);
            
            if ($user) {
                // 3. Delete any other related records (add more as needed)
                // Example: Delete user progress records
                if (class_exists('\App\Models\UserProgress')) {
                    DB::table('user_progress')->where('user_id', $userId)->delete();
                    Log::info("Deleted user progress records for user ID: {$userId}");
                }
                
                // Delete any payment records
                if (class_exists('\App\Models\Payment')) {
                    DB::table('payments')->where('user_id', $userId)->delete();
                    Log::info("Deleted payment records for user ID: {$userId}");
                }
                
                // Delete any other related tables
                // Add more tables as needed
                
                // 4. Finally delete the user
                $user->delete();
                Log::info("Deleted user account for user ID: {$userId}");
            }
            
            // Commit the transaction if all operations succeeded
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'User and all related information deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            // Rollback the transaction if any operation failed
            DB::rollBack();
            
            Log::error("Failed to delete user: {$e->getMessage()}");
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user information: ' . $e->getMessage()
            ], 500);
        }
    }
}
