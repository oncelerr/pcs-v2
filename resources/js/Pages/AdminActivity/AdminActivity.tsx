import React, { useState, useEffect, useCallback } from 'react';
import './AdminActivity.css';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal';

type Tab = 'activity' | 'reports' | 'admins';

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  created_at: string;
  admin: { id: number; name: string; email: string } | null;
  metadata: {
    file_path?: string;
    file_name?: string;
    user_id?: number;
    [key: string]: any;
  } | null;
}

interface ReportApproval {
  id: number;
  decision: 'approved' | 'rejected';
  comment: string | null;
  admin: { id: number; name: string; email: string };
  created_at: string;
}

interface Report {
  id: number;
  type: 'automated' | 'manual';
  title: string;
  summary: string;
  period_start: string | null;
  period_end: string | null;
  status: 'generated' | 'pending_approval' | 'approved' | 'rejected';
  created_by: number | null;
  creator: { id: number; name: string; email: string } | null;
  approvals: ReportApproval[];
  created_at: string;
}

interface AdminAccount {
  id: number;
  name: string;
  email: string;
  username: string;
  created_at: string;
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const REQUIRED_APPROVALS = 2;

const AdminActivity: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isSuperAdmin = hasRole('Super Admin');
  const [tab, setTab] = useState<Tab>(isSuperAdmin ? 'activity' : 'reports');

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm: () => {}
  });
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));
  const showError = (message: string) => setModalState({ isOpen: true, title: 'Error', message, type: 'error', onConfirm: closeModal });

  // --- Activity log ---
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLastPage, setLogsLastPage] = useState(1);
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null);

  const fetchLogs = useCallback(async (page: number) => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/activity-logs?page=${page}&per_page=20`, {
        headers: authHeaders(),
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setLogsPage(data.pagination.current_page);
        setLogsLastPage(data.pagination.last_page);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'activity' && isSuperAdmin) fetchLogs(1);
  }, [tab, isSuperAdmin, fetchLogs]);

  const handleViewDocument = async (log: ActivityLog) => {
    const filePath = log.metadata?.file_path;
    const fileName = log.metadata?.file_name || 'document';
    const userId = log.metadata?.user_id;

    if (!filePath || !userId) {
      showError('No document is attached to this activity entry.');
      return;
    }

    setViewingDocumentId(log.id);
    try {
      const res = await fetch('/api/get-document-url', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ userId, filePath, fileName, download: false })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get document URL');
      }

      const data = await res.json();
      if (!data.downloadUrl) throw new Error('No document URL received from server');

      window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to open document');
    } finally {
      setViewingDocumentId(null);
    }
  };

  // --- Reports ---
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [decidingReportId, setDecidingReportId] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetch('/api/admin/reports?per_page=20', {
        headers: authHeaders(),
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'reports') fetchReports();
  }, [tab, fetchReports]);

  const handleGenerateAutomated = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/reports/generate-automated', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate report');
      fetchReports();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitManual = async () => {
    if (!manualTitle.trim() || !manualSummary.trim()) {
      showError('Title and content are required.');
      return;
    }
    setSubmittingManual(true);
    try {
      const res = await fetch('/api/admin/reports/manual', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ title: manualTitle, summary: manualSummary })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit report');
      setShowManualForm(false);
      setManualTitle('');
      setManualSummary('');
      fetchReports();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleDecision = async (report: Report, decision: 'approve' | 'reject') => {
    setDecidingReportId(report.id);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/${decision}`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to ${decision} report`);
      fetchReports();
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to ${decision} report`);
    } finally {
      setDecidingReportId(null);
    }
  };

  // --- Admin accounts ---
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [resettingAdminId, setResettingAdminId] = useState<number | null>(null);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        headers: authHeaders(),
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'admins') fetchAdmins();
  }, [tab, fetchAdmins]);

  const handleCreateAdmin = async () => {
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminUsername.trim()) {
      showError('Name, email, and username are required.');
      return;
    }
    setCreatingAdmin(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ name: newAdminName, email: newAdminEmail, username: newAdminUsername })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create admin account');

      setShowAddAdminForm(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminUsername('');
      fetchAdmins();

      navigator.clipboard.writeText(data.temporary_password).catch(() => {});
      setModalState({
        isOpen: true,
        title: 'Admin Account Created',
        message: `Temporary password: <strong>${data.temporary_password}</strong><br/><span style="font-size:14px;color:#16a34a;">Copied to clipboard. Share it securely - it will not be shown again.</span>`,
        type: 'success',
        onConfirm: closeModal
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleResetAdminPassword = (admin: AdminAccount) => {
    setModalState({
      isOpen: true,
      title: 'Reset Admin Password',
      message: `Are you sure you want to reset the password for <strong>${admin.name}</strong> (${admin.email})? Their current password will stop working immediately.`,
      type: 'confirm',
      onConfirm: async () => {
        closeModal();
        setResettingAdminId(admin.id);
        try {
          const res = await fetch(`/api/admin/admins/${admin.id}/reset-password`, {
            method: 'POST',
            headers: authHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify({})
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reset password');

          navigator.clipboard.writeText(data.temporary_password).catch(() => {});
          setModalState({
            isOpen: true,
            title: 'Password Reset',
            message: `New temporary password for ${admin.name}: <strong>${data.temporary_password}</strong><br/><span style="font-size:14px;color:#16a34a;">Copied to clipboard. Share it securely - it will not be shown again.</span>`,
            type: 'success',
            onConfirm: closeModal
          });
        } catch (err) {
          showError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
          setResettingAdminId(null);
        }
      }
    });
  };

  const statusBadge = (status: Report['status']) => {
    const map: Record<Report['status'], { label: string; bg: string; color: string }> = {
      generated: { label: 'Generated', bg: '#E0F2FE', color: '#0369A1' },
      pending_approval: { label: 'Pending Approval', bg: '#FEF9C3', color: '#A16207' },
      approved: { label: 'Approved', bg: '#DCFCE7', color: '#16A34A' },
      rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#DC2626' },
    };
    const s = map[status];
    return <span className="aa-status-badge" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div className="admin-activity-container">
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
      />

      <div className="admin-activity-header">
        <img className="admin-activity-header-img" src="/assets/paper-icon.png" alt="" />
        <h3 className="admin-activity-title">Admin Activity &amp; Reports</h3>
      </div>

      <div className="admin-activity-tabs">
        {isSuperAdmin && (
          <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}>Activity Log</button>
        )}
        <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>Reports</button>
        <button className={tab === 'admins' ? 'active' : ''} onClick={() => setTab('admins')}>Admins</button>
      </div>

      {tab === 'activity' && isSuperAdmin && (
        <div className="admin-activity-panel">
          {logsLoading ? (
            <div className="aa-empty-state"><LoadingSpinner size="small" color="#126654" /></div>
          ) : logs.length === 0 ? (
            <div className="aa-empty-state">No activity recorded yet.</div>
          ) : (
            <>
              <table className="admin-activity-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const hasDocument = !!(log.action === 'document_upload' && log.metadata?.file_path);
                    return (
                      <tr key={log.id}>
                        <td>{log.admin ? log.admin.name : 'System'}</td>
                        <td><span className="aa-action-chip">{log.action.replace(/_/g, ' ')}</span></td>
                        <td>{log.description}</td>
                        <td>{formatDate(log.created_at)}</td>
                        <td>
                          {hasDocument ? (
                            <button
                              className="aa-view-document-btn"
                              disabled={viewingDocumentId === log.id}
                              onClick={() => handleViewDocument(log)}
                            >
                              {viewingDocumentId === log.id ? 'Opening...' : 'View Document'}
                            </button>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="admin-activity-pagination">
                <button disabled={logsPage <= 1} onClick={() => fetchLogs(logsPage - 1)}>Previous</button>
                <span>Page {logsPage} of {logsLastPage}</span>
                <button disabled={logsPage >= logsLastPage} onClick={() => fetchLogs(logsPage + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="admin-activity-panel">
          <div className="admin-activity-actions">
            <button className="aa-btn-primary" onClick={handleGenerateAutomated} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Automated Report (Last 7 Days)'}
            </button>
            <button className="aa-btn-secondary" onClick={() => setShowManualForm(prev => !prev)}>
              {showManualForm ? 'Cancel' : 'Create Manual Report'}
            </button>
          </div>

          {showManualForm && (
            <div className="aa-form-card">
              <input
                type="text"
                placeholder="Report title"
                value={manualTitle}
                onChange={e => setManualTitle(e.target.value)}
              />
              <textarea
                placeholder="Report content..."
                rows={5}
                value={manualSummary}
                onChange={e => setManualSummary(e.target.value)}
              />
              <p className="aa-form-hint">Requires approval from {REQUIRED_APPROVALS} other admins before it's finalized.</p>
              <button className="aa-btn-primary" onClick={handleSubmitManual} disabled={submittingManual}>
                {submittingManual ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          )}

          {reportsLoading ? (
            <div className="aa-empty-state"><LoadingSpinner size="small" color="#126654" /></div>
          ) : reports.length === 0 ? (
            <div className="aa-empty-state">No reports yet.</div>
          ) : (
            <div className="aa-report-list">
              {reports.map(report => {
                const approvedCount = report.approvals.filter(a => a.decision === 'approved').length;
                const alreadyVoted = report.approvals.some(a => a.admin.id === user?.id);
                const isCreator = report.created_by === user?.id;
                const canDecide = report.type === 'manual' && report.status === 'pending_approval' && !isCreator && !alreadyVoted;
                const isDeciding = decidingReportId === report.id;

                return (
                  <div className="aa-report-card" key={report.id}>
                    <div className="aa-report-card-header">
                      <div>
                        <span className={`aa-type-chip ${report.type}`}>{report.type === 'automated' ? 'Automated' : 'Manual'}</span>
                        <h4>{report.title}</h4>
                      </div>
                      {statusBadge(report.status)}
                    </div>
                    <pre className="aa-report-summary">{report.summary}</pre>
                    <div className="aa-report-meta">
                      {report.creator && <span>Submitted by {report.creator.name}</span>}
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                    {report.type === 'manual' && (
                      <div className="aa-report-approvals">
                        <span className="aa-approval-count">{approvedCount}/{REQUIRED_APPROVALS} approvals</span>
                        {report.approvals.map(a => (
                          <span key={a.id} className={`aa-approval-chip ${a.decision}`}>
                            {a.admin.name}: {a.decision}
                          </span>
                        ))}
                        {canDecide && (
                          <div className="aa-report-decision-actions">
                            <button className="aa-btn-approve" disabled={isDeciding} onClick={() => handleDecision(report, 'approve')}>Approve</button>
                            <button className="aa-btn-reject" disabled={isDeciding} onClick={() => handleDecision(report, 'reject')}>Reject</button>
                          </div>
                        )}
                        {isCreator && report.status === 'pending_approval' && (
                          <span className="aa-report-hint">Waiting on other admins - you can't approve your own report.</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'admins' && (
        <div className="admin-activity-panel">
          <div className="admin-activity-actions">
            <button className="aa-btn-primary" onClick={() => setShowAddAdminForm(prev => !prev)}>
              {showAddAdminForm ? 'Cancel' : 'Create Admin Account'}
            </button>
          </div>

          {showAddAdminForm && (
            <div className="aa-form-card">
              <input type="text" placeholder="Full name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} />
              <input type="email" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
              <input type="text" placeholder="Username" value={newAdminUsername} onChange={e => setNewAdminUsername(e.target.value)} />
              <button className="aa-btn-primary" onClick={handleCreateAdmin} disabled={creatingAdmin}>
                {creatingAdmin ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          )}

          {adminsLoading ? (
            <div className="aa-empty-state"><LoadingSpinner size="small" color="#126654" /></div>
          ) : admins.length === 0 ? (
            <div className="aa-empty-state">No admin accounts found.</div>
          ) : (
            <table className="admin-activity-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.username}</td>
                    <td>{formatDate(admin.created_at)}</td>
                    <td>
                      <button
                        className="aa-view-document-btn"
                        disabled={resettingAdminId === admin.id}
                        onClick={() => handleResetAdminPassword(admin)}
                      >
                        {resettingAdminId === admin.id ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
