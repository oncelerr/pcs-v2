<?php

namespace App\Http\Controllers;

use App\Models\AdminActivityLog;
use App\Models\AdminReport;
use App\Models\AdminReportApproval;
use App\Services\AdminActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminReportController extends Controller
{
    /**
     * Paginated listing of reports, optionally filtered by type/status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AdminReport::with(['creator:id,name,email', 'approvals.admin:id,name,email'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 10);
        $reports = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $reports->items(),
            'pagination' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    /**
     * Show a single report with its approval trail.
     *
     * @param  \App\Models\AdminReport  $report
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(AdminReport $report)
    {
        $report->load(['creator:id,name,email', 'approvals.admin:id,name,email']);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Compile admin activity logs for a period into an automated report.
     * No approval is required - it's a read-only system-generated summary,
     * so it can be triggered on demand by any admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateAutomated(Request $request)
    {
        $validated = $request->validate([
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
        ]);

        $periodEnd = isset($validated['period_end'])
            ? Carbon::parse($validated['period_end'])->endOfDay()
            : now();

        $periodStart = isset($validated['period_start'])
            ? Carbon::parse($validated['period_start'])->startOfDay()
            : (clone $periodEnd)->subDays(7)->startOfDay();

        $logs = AdminActivityLog::with('admin:id,name,email')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->get();

        $totalActions = $logs->count();

        $byAdmin = $logs->groupBy(fn ($log) => $log->admin?->name ?? "Admin #{$log->admin_id}")
            ->map->count()
            ->sortDesc();

        $byAction = $logs->groupBy('action')
            ->map->count()
            ->sortDesc();

        $lines = [];
        $lines[] = "Admin activity report for " . $periodStart->format('M j, Y') . ' - ' . $periodEnd->format('M j, Y');
        $lines[] = "Total actions recorded: {$totalActions}";
        $lines[] = '';
        $lines[] = 'Actions by admin:';
        foreach ($byAdmin as $adminName => $count) {
            $lines[] = "  - {$adminName}: {$count}";
        }
        $lines[] = '';
        $lines[] = 'Actions by type:';
        foreach ($byAction as $action => $count) {
            $lines[] = "  - {$action}: {$count}";
        }

        $report = AdminReport::create([
            'type' => AdminReport::TYPE_AUTOMATED,
            'title' => 'Automated Activity Report: ' . $periodStart->format('M j') . ' - ' . $periodEnd->format('M j, Y'),
            'summary' => implode("\n", $lines),
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'status' => AdminReport::STATUS_GENERATED,
            'created_by' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Automated report generated',
            'data' => $report,
        ], 201);
    }

    /**
     * Create a manual report. Requires approval from 2 distinct admins
     * (other than the creator) before it's considered finalized.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
        ]);

        $report = AdminReport::create([
            'type' => AdminReport::TYPE_MANUAL,
            'title' => $validated['title'],
            'summary' => $validated['summary'],
            'period_start' => $validated['period_start'] ?? null,
            'period_end' => $validated['period_end'] ?? null,
            'status' => AdminReport::STATUS_PENDING_APPROVAL,
            'created_by' => $request->user()->id,
        ]);

        AdminActivityLogger::log(
            'manual_report_submitted',
            "Submitted manual report \"{$report->title}\" for approval",
            $report
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual report submitted for approval',
            'data' => $report,
        ], 201);
    }

    /**
     * Approve a pending manual report. Once 2 distinct admins (other than
     * the creator) have approved, the report is finalized.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\AdminReport  $report
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Request $request, AdminReport $report)
    {
        $validated = $request->validate([
            'comment' => 'nullable|string',
        ]);

        $decisionResult = $this->recordDecision($request, $report, AdminReportApproval::DECISION_APPROVED, $validated['comment'] ?? null);

        if ($decisionResult instanceof \Illuminate\Http\JsonResponse) {
            return $decisionResult;
        }

        $approvalCount = $report->approvals()->where('decision', AdminReportApproval::DECISION_APPROVED)->count();

        if ($approvalCount >= AdminReport::REQUIRED_APPROVALS) {
            $report->update(['status' => AdminReport::STATUS_APPROVED]);

            AdminActivityLogger::log(
                'manual_report_approved',
                "Report \"{$report->title}\" reached the required {$approvalCount} approvals and is now approved",
                $report
            );
        } else {
            AdminActivityLogger::log(
                'manual_report_approval_cast',
                "Approved report \"{$report->title}\" ({$approvalCount}/" . AdminReport::REQUIRED_APPROVALS . ' approvals)',
                $report
            );
        }

        return response()->json([
            'success' => true,
            'message' => $approvalCount >= AdminReport::REQUIRED_APPROVALS
                ? 'Report approved'
                : "Approval recorded ({$approvalCount}/" . AdminReport::REQUIRED_APPROVALS . ' needed)',
            'data' => $report->fresh(['creator:id,name,email', 'approvals.admin:id,name,email']),
        ]);
    }

    /**
     * Reject a pending manual report. A single rejection is enough to
     * stop it - it does not require consensus like approval does.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\AdminReport  $report
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, AdminReport $report)
    {
        $validated = $request->validate([
            'comment' => 'nullable|string',
        ]);

        $decisionResult = $this->recordDecision($request, $report, AdminReportApproval::DECISION_REJECTED, $validated['comment'] ?? null);

        if ($decisionResult instanceof \Illuminate\Http\JsonResponse) {
            return $decisionResult;
        }

        $report->update(['status' => AdminReport::STATUS_REJECTED]);

        AdminActivityLogger::log(
            'manual_report_rejected',
            "Rejected report \"{$report->title}\"",
            $report,
            ['comment' => $validated['comment'] ?? null]
        );

        return response()->json([
            'success' => true,
            'message' => 'Report rejected',
            'data' => $report->fresh(['creator:id,name,email', 'approvals.admin:id,name,email']),
        ]);
    }

    /**
     * Shared guardrails + persistence for approve/reject: only manual,
     * pending reports can be decided; the creator can't decide their own
     * report; and an admin can't vote twice.
     *
     * @return \Illuminate\Http\JsonResponse|null  A JSON error response if blocked, null if the decision was recorded.
     */
    private function recordDecision(Request $request, AdminReport $report, string $decision, ?string $comment)
    {
        if ($report->type !== AdminReport::TYPE_MANUAL) {
            return response()->json([
                'success' => false,
                'message' => 'Only manual reports require approval',
            ], 422);
        }

        if ($report->status !== AdminReport::STATUS_PENDING_APPROVAL) {
            return response()->json([
                'success' => false,
                'message' => 'This report is no longer pending approval',
            ], 422);
        }

        $adminId = $request->user()->id;

        if ($report->created_by === $adminId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot approve or reject your own report',
            ], 403);
        }

        if ($report->approvals()->where('admin_id', $adminId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You have already voted on this report',
            ], 422);
        }

        AdminReportApproval::create([
            'report_id' => $report->id,
            'admin_id' => $adminId,
            'decision' => $decision,
            'comment' => $comment,
        ]);

        return null;
    }
}
