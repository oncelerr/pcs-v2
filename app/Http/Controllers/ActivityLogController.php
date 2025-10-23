<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ActivityLogController extends Controller
{
    /**
     * Get recent activities for admin dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentActivities(Request $request)
    {
        // Default to 10 activities, but allow customization
        $limit = $request->input('limit', 10);
        
        // Get all tables in the database
        $tables = Schema::getAllTables();
        $tableNames = [];
        
        // Extract table names from the result
        foreach ($tables as $table) {
            $tableInfo = (array) $table;
            $tableName = reset($tableInfo); // Get the first value which is the table name
            $tableNames[] = $tableName;
        }
        
        $activities = [];
        
        // Check each table for recent activities
        foreach ($tableNames as $tableName) {
            // Skip migrations and other system tables
            if (in_array($tableName, ['migrations', 'failed_jobs', 'password_resets', 'personal_access_tokens'])) {
                continue;
            }
            
            // Check if the table has updated_at and created_at columns
            if (Schema::hasColumn($tableName, 'updated_at') && Schema::hasColumn($tableName, 'created_at')) {
                // Get the most recent records from this table
                $recentRecords = DB::table($tableName)
                    ->orderBy('updated_at', 'desc')
                    ->limit($limit)
                    ->get();
                
                foreach ($recentRecords as $record) {
                    $activityType = $this->determineActivityType($tableName);
                    $title = $this->generateTitle($tableName, $record);
                    $details = $this->generateDetails($tableName, $record);
                    
                    $activities[] = [
                        'id' => $tableName . '_' . $record->id,
                        'title' => $title,
                        'details' => $details,
                        'time' => Carbon::parse($record->updated_at)->diffForHumans(),
                        'created_at' => $record->updated_at,
                        'type' => $activityType
                    ];
                }
            }
        }
        
        // Sort all activities by updated_at
        usort($activities, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        // Limit to the requested number
        $activities = array_slice($activities, 0, $limit);
        
        return response()->json([
            'success' => true,
            'activities' => $activities
        ]);
    }
    
    /**
     * Determine the activity type based on the table name
     *
     * @param string $tableName
     * @return string
     */
    private function determineActivityType(string $tableName): string
    {
        // Map table names to activity types
        $tableTypeMap = [
            'users' => 'user',
            'documents' => 'document',
            'payments' => 'payment',
            'compliance_alerts' => 'alert',
            'stages' => 'alert',
            'stage_items' => 'alert',
            'user_stage_items' => 'alert',
            'client_compliance_files' => 'document',
            'compliance_users' => 'user',
            'user_documents' => 'document',
            'user_information' => 'user'
        ];
        
        // Return the mapped type or a default type
        return $tableTypeMap[$tableName] ?? $this->guessActivityType($tableName);
    }
    
    /**
     * Guess the activity type based on the table name
     *
     * @param string $tableName
     * @return string
     */
    private function guessActivityType(string $tableName): string
    {
        // Try to guess the type based on the table name
        if (strpos($tableName, 'user') !== false) {
            return 'user';
        }
        
        if (strpos($tableName, 'document') !== false || strpos($tableName, 'file') !== false) {
            return 'document';
        }
        
        if (strpos($tableName, 'payment') !== false || strpos($tableName, 'transaction') !== false) {
            return 'payment';
        }
        
        if (strpos($tableName, 'alert') !== false || strpos($tableName, 'notification') !== false) {
            return 'alert';
        }
        
        // Default type
        return 'alert';
    }
    
    /**
     * Generate a title for the activity based on the table and record
     *
     * @param string $tableName
     * @param object $record
     * @return string
     */
    private function generateTitle(string $tableName, object $record): string
    {
        // Check if this is a new record or an update
        $isNew = Carbon::parse($record->created_at)->diffInMinutes(Carbon::parse($record->updated_at)) < 5;
        
        // Generate title based on table name
        switch ($tableName) {
            case 'users':
                return $isNew ? 'New User Registration' : 'User Profile Updated';
                
            case 'documents':
            case 'client_compliance_files':
            case 'user_documents':
                return $isNew ? 'New Document Uploaded' : 'Document Updated';
                
            case 'payments':
                return 'Payment Processed';
                
            case 'compliance_alerts':
                return 'Compliance Alert';
                
            case 'stages':
                return 'Stage Updated';
                
            case 'stage_items':
                return 'Stage Item Updated';
                
            case 'user_stage_items':
                return 'User Progress Updated';
                
            case 'compliance_users':
                return $isNew ? 'New Compliance User' : 'Compliance User Updated';
                
            case 'user_information':
                return 'User Information Updated';
                
            default:
                return 'Record Updated in ' . ucfirst(str_replace('_', ' ', $tableName));
        }
    }
    
    /**
     * Generate details for the activity based on the table and record
     *
     * @param string $tableName
     * @param object $record
     * @return string
     */
    private function generateDetails(string $tableName, object $record): string
    {
        // Try to find a descriptive field in the record
        $nameFields = ['name', 'title', 'description', 'email', 'file_name', 'document_name'];
        $userIdFields = ['user_id'];
        
        $recordArray = (array) $record;
        $description = '';
        
        // Try to find a name field
        foreach ($nameFields as $field) {
            if (isset($recordArray[$field]) && !empty($recordArray[$field])) {
                $description = $recordArray[$field];
                break;
            }
        }
        
        // Try to find a user ID field
        $userId = null;
        foreach ($userIdFields as $field) {
            if (isset($recordArray[$field]) && !empty($recordArray[$field])) {
                $userId = $recordArray[$field];
                break;
            }
        }
        
        // Generate details based on table name and available fields
        switch ($tableName) {
            case 'users':
                return isset($recordArray['name']) ? "User {$recordArray['name']} ({$recordArray['email']})" : "User #{$record->id}";
                
            case 'documents':
            case 'client_compliance_files':
            case 'user_documents':
                $docName = $description ?: 'Document';
                if ($userId) {
                    return "User #{$userId} - {$docName}";
                }
                return $docName;
                
            case 'payments':
                $amount = isset($recordArray['amount']) ? '$' . number_format($recordArray['amount'], 2) : '';
                $paymentFor = isset($recordArray['payment_for']) ? $recordArray['payment_for'] : '';
                
                if ($userId && $amount && $paymentFor) {
                    return "User #{$userId} paid {$amount} for {$paymentFor}";
                } elseif ($userId) {
                    return "Payment from User #{$userId}";
                }
                return "Payment processed";
                
            case 'compliance_alerts':
                return $description ?: "Compliance alert generated";
                
            case 'stages':
            case 'stage_items':
                return $description ?: "Stage information updated";
                
            case 'user_stage_items':
                if ($userId) {
                    return "User #{$userId} progress updated";
                }
                return "User progress updated";
                
            default:
                if ($description && $userId) {
                    return "User #{$userId} - {$description}";
                } elseif ($description) {
                    return $description;
                } elseif ($userId) {
                    return "User #{$userId} - Record updated";
                }
                return "Record #{$record->id} updated";
        }
    }
}
