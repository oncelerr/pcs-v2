import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import LoadingSpinner from '../../../../Components/LoadingSpinner/LoadingSpinner';
import './AdminDashboard.css';
import axios from 'axios';

interface UserStats {
  completed: number;
  ongoing: number;
  unprocessed: number;
  total: number;
}

interface Activity {
  id: string;
  title: string;
  details: string;
  time: string;
  type: 'document' | 'payment' | 'alert' | 'user';
  created_at: string;
}

interface AdminDashboardProps {
  loadingStats: boolean;
  userStats: UserStats;
  createPieChartData: () => any;
  chartOptions: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  loadingStats,
  userStats,
  createPieChartData,
  chartOptions
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await axios.get('/admin/activities?limit=4');
        if (response.data.success) {
          setActivities(response.data.activities);
        } else {
          console.error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();

    // Refresh activities every 5 minutes
    const intervalId = setInterval(fetchActivities, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="admin-content">
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
      </div>
      <div className="ad-db-right">
        <div className="card">
          <div className="card__header">
            <div className="card__header-icon">🔔</div>
            <div className="card__header-title">Recent Activity</div>
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
                    <div className={`activity-item__icon activity-item__icon--${activity.type}`}>
                      {activity.type === 'document' && '📄'}
                      {activity.type === 'payment' && '💰'}
                      {activity.type === 'alert' && '⚠️'}
                      {activity.type === 'user' && '👤'}
                    </div>
                    <div className="activity-item__content">
                      <div className="activity-item__title">{activity.title}</div>
                      <div className="activity-item__details">{activity.details}</div>
                      <div className="activity-item__time">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="loading-activity">
                  <p>No recent activities found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;