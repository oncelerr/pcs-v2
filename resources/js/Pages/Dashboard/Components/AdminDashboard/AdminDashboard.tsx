import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import LoadingSpinner from '../../../../Components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../../../contexts/AuthContext';
import './AdminDashboard.css';

interface UserStats {
  completed: number;
  ongoing: number;
  unprocessed: number;
  total: number;
}

interface PaymentStats {
  paid: number;
  unpaid: number;
}

interface ComplianceStepStat {
  label: string;
  done: number;
  inProgress: number;
  pending: number;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  created_at: string;
  admin: { id: number; name: string } | null;
}

interface PendingReport {
  id: number;
  title: string;
  created_at: string;
  creator: { id: number; name: string } | null;
  approvals: { id: number; decision: string }[];
}

interface AdminDashboardProps {
  loadingStats: boolean;
  userStats: UserStats;
  paymentStats: PaymentStats;
  complianceStepStats: ComplianceStepStat[];
  createPieChartData: () => any;
  chartOptions: any;
}

const authHeaders = (): Record<string, string> => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const authToken = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken || '',
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': `Bearer ${authToken}`,
  };
};

const timeAgo = (dateString: string): string => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const StatTile: React.FC<{ label: string; value: number; accent: string; icon: string }> = ({ label, value, accent, icon }) => (
  <div className="stat-tile">
    <div className="stat-tile__icon" style={{ backgroundColor: `${accent}1A`, color: accent }}>{icon}</div>
    <div>
      <div className="stat-tile__value">{value}</div>
      <div className="stat-tile__label">{label}</div>
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  loadingStats,
  userStats,
  paymentStats,
  complianceStepStats,
  createPieChartData,
  chartOptions
}) => {
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('Super Admin');

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);

  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const res = await fetch('/api/admin/activity-logs?per_page=5', {
        headers: authHeaders(),
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) setActivities(data.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const fetchPendingReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await fetch('/api/admin/reports?type=manual&status=pending_approval&per_page=5', {
        headers: authHeaders(),
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) setPendingReports(data.data);
    } catch (error) {
      console.error('Error fetching pending reports:', error);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) fetchActivities();
    fetchPendingReports();

    // Refresh every 5 minutes
    const intervalId = setInterval(() => {
      if (isSuperAdmin) fetchActivities();
      fetchPendingReports();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isSuperAdmin, fetchActivities, fetchPendingReports]);

  const maxStepCount = Math.max(
    1,
    ...complianceStepStats.map(s => s.done + s.inProgress + s.pending)
  );

  return (
    <div className="admin-content">
      {/* KPI Stat Tiles */}
      <div className="stat-tile-row">
        {loadingStats ? (
          <div className="loading-stats"><LoadingSpinner size="small" color="#126654" /></div>
        ) : (
          <>
            <StatTile label="Total Users" value={userStats.total} accent="#146755" icon="👥" />
            <StatTile label="Completed" value={userStats.completed} accent="#4CAF50" icon="✅" />
            <StatTile label="On-Going" value={userStats.ongoing} accent="#FFC107" icon="⏳" />
            <StatTile label="Unprocessed" value={userStats.unprocessed} accent="#F44336" icon="🕗" />
            <StatTile label="Paid" value={paymentStats.paid} accent="#2196F3" icon="💳" />
            <StatTile label="Unpaid" value={paymentStats.unpaid} accent="#FF9800" icon="⚠️" />
          </>
        )}
      </div>

      <div className="admin-dashboard-grid">
        <div className="ad-db-left">
          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📄</div>
              <div className="card__header-title">User Statistics</div>
            </div>
            <div className="card__body">
              <div className="admin-dashboard">
                <div className="admin-stats">
                  {loadingStats ? (
                    <div className="loading-stats">
                      <LoadingSpinner size="small" color="#126654" />
                    </div>
                  ) : (
                    <div className="stats-container">
                      <div className="pie-chart-container">
                        <div style={{ position: 'relative', width: '80%', margin: '0 auto' }}>
                          <Pie data={createPieChartData()} options={chartOptions} />
                        </div>
                        <div className="stats-summary">
                          <div className="stats-item">
                            <div className="stats-item__value stats-item__value--completed">{userStats.completed}</div>
                            <div className="stats-item__label">Completed</div>
                          </div>
                          <div className="stats-item">
                            <div className="stats-item__value stats-item__value--ongoing">{userStats.ongoing}</div>
                            <div className="stats-item__label">On-Going</div>
                          </div>
                          <div className="stats-item">
                            <div className="stats-item__value stats-item__value--unprocessed">{userStats.unprocessed}</div>
                            <div className="stats-item__label">Unprocessed</div>
                          </div>
                        </div>
                        {userStats.total === 0 && (
                          <div className="no-data-overlay">
                            <div className="no-data-title">No Data Available</div>
                            <div className="no-data-message">There are currently no users in the system.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📋</div>
              <div className="card__header-title">Compliance Step Breakdown</div>
            </div>
            <div className="card__body">
              {loadingStats ? (
                <div className="loading-stats"><LoadingSpinner size="small" color="#126654" /></div>
              ) : complianceStepStats.length === 0 || userStats.total === 0 ? (
                <div className="aa-empty-state">No compliance data available.</div>
              ) : (
                <div className="step-breakdown">
                  {complianceStepStats.map((step) => {
                    const total = step.done + step.inProgress + step.pending;
                    return (
                      <div className="step-row" key={step.label}>
                        <div className="step-row__header">
                          <span className="step-row__label">{step.label}</span>
                          <span className="step-row__total">{total} users</span>
                        </div>
                        <div className="step-row__bar" style={{ width: `${(total / maxStepCount) * 100}%` }}>
                          {total > 0 && (
                            <>
                              <div className="step-row__segment step-row__segment--done" style={{ width: `${(step.done / total) * 100}%` }} />
                              <div className="step-row__segment step-row__segment--in-progress" style={{ width: `${(step.inProgress / total) * 100}%` }} />
                              <div className="step-row__segment step-row__segment--pending" style={{ width: `${(step.pending / total) * 100}%` }} />
                            </>
                          )}
                        </div>
                        <div className="step-row__legend">
                          <span><i className="dot dot--done" />{step.done} Done</span>
                          <span><i className="dot dot--in-progress" />{step.inProgress} In Progress</span>
                          <span><i className="dot dot--pending" />{step.pending} Pending</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ad-db-right">
          {isSuperAdmin && (
            <div className="card">
              <div className="card__header">
                <div className="card__header-icon">🔔</div>
                <div className="card__header-title">Recent Admin Activity</div>
                <Link to="/admin-activity" className="card__header-link">View All</Link>
              </div>
              <div className="card__body">
                <div className="activity-list">
                  {loadingActivities ? (
                    <div className="loading-activity">
                      <LoadingSpinner size="small" color="#126654" />
                    </div>
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-item__icon activity-item__icon--user">
                          👤
                        </div>
                        <div className="activity-item__content">
                          <div className="activity-item__title">{activity.admin ? activity.admin.name : 'System'}</div>
                          <div className="activity-item__details">{activity.description}</div>
                          <div className="activity-item__time">{timeAgo(activity.created_at)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="loading-activity">
                      <p>No recent activity found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card__header">
              <div className="card__header-icon">📝</div>
              <div className="card__header-title">Reports Pending Approval</div>
              <Link to="/admin-activity" className="card__header-link">View All</Link>
            </div>
            <div className="card__body">
              <div className="activity-list">
                {loadingReports ? (
                  <div className="loading-activity">
                    <LoadingSpinner size="small" color="#126654" />
                  </div>
                ) : pendingReports.length > 0 ? (
                  pendingReports.map((report) => {
                    const approvedCount = report.approvals.filter(a => a.decision === 'approved').length;
                    return (
                      <div key={report.id} className="activity-item">
                        <div className="activity-item__icon" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
                          📝
                        </div>
                        <div className="activity-item__content">
                          <div className="activity-item__title">{report.title}</div>
                          <div className="activity-item__details">
                            Submitted by {report.creator?.name || 'Unknown'} · {approvedCount}/2 approvals
                          </div>
                          <div className="activity-item__time">{timeAgo(report.created_at)}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="loading-activity">
                    <p>No reports awaiting approval</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
