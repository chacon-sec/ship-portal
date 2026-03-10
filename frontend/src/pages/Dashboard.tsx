import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import '../styles/Dashboard.css';

interface ShipStatus {
  navigation?: { status: string; eta: string };
  fuel?: { percentage: number; hoursRemaining: number };
  diagnostics?: { overallStatus: string };
  eta?: string;
}

interface FuelResponse {
  summary?: {
    percentageFull?: number;
    hoursRemaining?: number;
  };
}

interface DiagnosticsResponse {
  engine?: Record<string, { status?: 'operational' | 'warning' | 'critical' }>;
  hull?: Record<string, { status?: 'operational' | 'warning' | 'critical' }>;
  electrical?: Record<string, { status?: 'operational' | 'warning' | 'critical' }>;
}

export default function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const { data: navigationData, request: fetchNavigation, isLoading: isNavigationLoading, error: navigationError } = useApi<ShipStatus>();
  const { data: fuelData, request: fetchFuel, isLoading: isFuelLoading, error: fuelError } = useApi<FuelResponse>();
  const { data: diagnosticsData, request: fetchDiagnostics, isLoading: isDiagnosticsLoading, error: diagnosticsError } = useApi<DiagnosticsResponse>();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    loadShipStatus();
  }, []);

  const loadShipStatus = async () => {
    await Promise.allSettled([
      fetchNavigation('/api/navigation'),
      fetchFuel('/api/fuel'),
      fetchDiagnostics('/api/diagnostics'),
    ]);
  };

  const navigationEta = navigationData?.navigation?.eta || navigationData?.eta || 'Unknown';
  const fuelPercentage = fuelData?.summary?.percentageFull ?? 0;
  const fuelHoursRemaining = fuelData?.summary?.hoursRemaining;
  const diagnosticStatuses = [
    ...Object.values(diagnosticsData?.engine || {}),
    ...Object.values(diagnosticsData?.hull || {}),
    ...Object.values(diagnosticsData?.electrical || {}),
  ].map((metric) => metric?.status);

  const diagnosticsStatus = diagnosticStatuses.includes('critical')
    ? 'CRITICAL'
    : diagnosticStatuses.includes('warning')
      ? 'WARNING'
      : diagnosticStatuses.length > 0
        ? 'OPERATIONAL'
        : 'Unknown';
  const isLoading = isNavigationLoading || isFuelLoading || isDiagnosticsLoading;
  const error = navigationError || fuelError || diagnosticsError;

  return (
    <div className="container">
      <div className="nav-header">
        <h1 className="nav-title">⚓ Ship Navigation Portal</h1>
        <nav className="nav-menu">
          <Link to="/dashboard">Dashboard</Link>
          {(hasRole('captain') || hasRole('first_officer')) && <Link to="/navigation">Navigation</Link>}
          {(hasRole('captain') || hasRole('first_officer') || hasRole('engineer')) && <Link to="/fuel">Fuel</Link>}
          {(hasRole('captain') || hasRole('engineer') || hasRole('crew_member')) && <Link to="/diagnostics">Diagnostics</Link>}
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
        <h2 className="page-title">
          {greeting}, {user?.username}! 👋
        </h2>

        <div className="dashboard-intro">
          <div className="intro-card">
            <h3>Welcome to Your Ship</h3>
            <p>
              You have been assigned the following role(s): <strong>{user?.roles?.join(', ') || 'none'}</strong>
            </p>
            <p>
              Access to ship controls and information is based on your role. Use the navigation menu
              to access different sections of the portal.
            </p>
          </div>
        </div>

        <div className="dashboard-sections">
          <h3>Available Controls</h3>
          <div className="controls-grid">
            {(hasRole('captain') || hasRole('first_officer')) && (
              <Link to="/navigation" className="control-card navigation">
                <div className="card-icon">🗺️</div>
                <h4>Navigation</h4>
                <p>
                  {hasRole('captain')
                    ? 'Control ship routing and set waypoints'
                    : 'View route status, navigation diagnostics, and crew assignments'}
                </p>
              </Link>
            )}

            {(hasRole('captain') || hasRole('first_officer') || hasRole('engineer')) && (
              <Link to="/fuel" className="control-card fuel">
                <div className="card-icon">⛽</div>
                <h4>Fuel Management</h4>
                <p>
                  {hasRole('first_officer') && !hasRole('captain') && !hasRole('engineer')
                    ? 'Monitor fuel and request reallocation between tanks'
                    : 'Monitor and allocate fuel reserves'}
                </p>
              </Link>
            )}

            {(hasRole('captain') || hasRole('engineer') || hasRole('crew_member')) && (
              <Link to="/diagnostics" className="control-card diagnostics">
                <div className="card-icon">📊</div>
                <h4>Ship Diagnostics</h4>
                <p>
                  {hasRole('crew_member') && !hasRole('captain') && !hasRole('engineer')
                    ? 'View assigned diagnostics (read-only)'
                    : 'View system status and alerts'}
                </p>
              </Link>
            )}

            <Link to="/operations" className="control-card">
              <div className="card-icon">🧭</div>
              <h4>Role Operations</h4>
              <p>Execute role-based tasks and see restricted actions</p>
            </Link>

            {!hasRole('captain') && !hasRole('first_officer') && !hasRole('engineer') && !hasRole('crew_member') && (
              <div className="control-card disabled">
                <div className="card-icon">🔒</div>
                <h4>Limited Access</h4>
                <p>Upgrade your role to access more features</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-status">
          <h3>Ship Status Overview</h3>
          {isLoading && <p>Loading ship status...</p>}
          {error && <div className="error-message">Error loading status: {error.message}</div>}

          <div className="status-overview">
            <div className="status-box">
              <h4>Navigation</h4>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge operational`}>Active</span>
              </p>
              <p><strong>ETA:</strong> {navigationEta}</p>
            </div>
            <div className="status-box">
              <h4>Fuel Reserves</h4>
              <p>
                <strong>Level:</strong>{' '}
                <span className={`fuel-level ${fuelPercentage > 50 ? 'good' : 'warning'}`}>
                  {Math.round(fuelPercentage)}%
                </span>
              </p>
              {typeof fuelHoursRemaining === 'number' && (
                <p><strong>Hours Remaining:</strong> {Math.round(fuelHoursRemaining * 10) / 10}</p>
              )}
            </div>
            <div className="status-box">
              <h4>Ship Diagnostics</h4>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${diagnosticsStatus === 'OPERATIONAL' ? 'operational' : 'warning'}`}>
                  {diagnosticsStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-info">
          <h3>About Your Role</h3>
          <div className="role-info">
            {hasRole('captain') && (
              <div className="info-section">
                <h4>🫡 Captain</h4>
                <ul>
                  <li>Full access to all ship controls</li>
                  <li>Can reroute the ship and set new waypoints</li>
                  <li>Allocate fuel reserves across departments</li>
                  <li>View and manage all diagnostics</li>
                  <li>Clear critical alerts</li>
                </ul>
              </div>
            )}
            {hasRole('first_officer') && (
              <div className="info-section">
                <h4>🧑‍✈️ First Officer</h4>
                <ul>
                  <li>View current ship route and navigation diagnostics</li>
                  <li>Request fuel reallocation</li>
                  <li>View crew assignments</li>
                  <li>Cannot modify routes or critical systems</li>
                </ul>
              </div>
            )}
            {hasRole('engineer') && (
              <div className="info-section">
                <h4>🔧 Engineer</h4>
                <ul>
                  <li>Modify ship diagnostics settings</li>
                  <li>View fuel status and consumption rates</li>
                  <li>View engine metrics and performance data</li>
                  <li>Cannot modify routes or allocate fuel</li>
                </ul>
              </div>
            )}
            {hasRole('crew_member') && (
              <div className="info-section">
                <h4>👨‍💼 Crew Member</h4>
                <ul>
                  <li>View current ship status (read-only)</li>
                  <li>View assigned diagnostics</li>
                  <li>Cannot modify anything</li>
                  <li>Limited access to ship systems</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
