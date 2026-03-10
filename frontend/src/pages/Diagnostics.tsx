import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { StatusPanel } from '../components/StatusPanel';
import '../styles/Diagnostics.css';

interface SystemStatus {
  name: string;
  status: 'operational' | 'warning' | 'critical';
  value: number;
  unit: string;
}

interface Diagnostics {
  engine: Record<string, SystemStatus>;
  hull: Record<string, SystemStatus>;
  electrical: Record<string, SystemStatus>;
}

interface Alert {
  id: string;
  timestamp: string;
  user: string;
  system: string;
  metric: string;
  oldValue: number;
  newValue: number;
  status: string;
}

export default function Diagnostics() {
  const { user, logout, hasRole } = useAuth();
  const { data: diagnostics, request: fetchDiagnostics, isLoading, error } = useApi<Diagnostics>();
  const { data: alerts, request: fetchAlerts } = useApi<Alert[]>();

  useEffect(() => {
    loadDiagnostics();
    loadAlerts();
  }, []);

  const loadDiagnostics = async () => {
    try {
      await fetchDiagnostics('/api/diagnostics');
    } catch {
      // Handle error silently
    }
  };

  const loadAlerts = async () => {
    try {
      await fetchAlerts('/api/diagnostics/alerts');
    } catch {
      // Handle error silently
    }
  };

  const convertToStatusItems = (systemData: Record<string, SystemStatus>) => {
    return Object.values(systemData).map((item) => ({
      name: item.name,
      status: item.status,
      value: item.value,
      unit: item.unit,
    }));
  };

  return (
    <div className="container">
      <div className="nav-header">
        <h1 className="nav-title">⚓ Ship Navigation Portal</h1>
        <nav className="nav-menu">
          <Link to="/dashboard">Dashboard</Link>
          {hasRole('captain') && <Link to="/navigation">Navigation</Link>}
          {(hasRole('captain') || hasRole('engineer')) && <Link to="/fuel">Fuel</Link>}
          {(hasRole('captain') || hasRole('engineer')) && <Link to="/diagnostics">Diagnostics</Link>}
          <Link to="/operations">Operations</Link>
        </nav>
        <div className="user-info">
          <span className="user-name">{user?.username}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="page-content">
        <h2 className="page-title">📊 Ship Diagnostics System</h2>

        {error && <div className="error-message">Error loading diagnostics: {error.message}</div>}

        {isLoading ? (
          <p>Loading diagnostics...</p>
        ) : diagnostics ? (
          <>
            <div className="diagnostics-container">
              <StatusPanel
                title="Engine Systems"
                items={convertToStatusItems(diagnostics.engine)}
              />

              <StatusPanel
                title="Hull Systems"
                items={convertToStatusItems(diagnostics.hull)}
              />

              <StatusPanel
                title="Electrical Systems"
                items={convertToStatusItems(diagnostics.electrical)}
              />
            </div>

            <div className="alerts-section">
              <h3>Alert History</h3>
              {alerts && alerts.length > 0 ? (
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-header">
                        <span className="alert-system">{alert.system.toUpperCase()}</span>
                        <span
                          className={`alert-status ${alert.status.toLowerCase()}`}
                        >
                          {alert.status}
                        </span>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="alert-details">
                        <p>
                          <strong>Metric:</strong> {alert.metric}
                        </p>
                        <p>
                          <strong>Change:</strong> {alert.oldValue} → {alert.newValue} {/* unit would go here */}
                        </p>
                        <p>
                          <strong>Modified by:</strong> {alert.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-alerts">No alerts recorded</p>
              )}
            </div>

            {hasRole('captain') && (
              <div className="diagnostics-actions">
                <h3>Administrative Actions</h3>
                <button className="clear-alerts-btn" onClick={() => {
                  if (window.confirm('Are you sure you want to clear all critical alerts?')) {
                    alert('Critical alerts cleared (mock)');
                  }
                }}>
                  Clear Critical Alerts
                </button>
              </div>
            )}
          </>
        ) : (
          <p>No diagnostics data available</p>
        )}
      </div>
    </div>
  );
}
