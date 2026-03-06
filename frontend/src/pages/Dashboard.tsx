import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { StatusPanel } from '../components/StatusPanel';
import '../styles/Dashboard.css';

interface ShipStatus {
  navigation: { status: string; eta: string };
  fuel: { percentage: number; hoursRemaining: number };
  diagnostics: { overallStatus: string };
}

export default function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const { data: shipStatus, request: fetchStatus, isLoading, error } = useApi<ShipStatus>();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    loadShipStatus();
  }, []);

  const loadShipStatus = async () => {
    try {
      await fetchStatus('/api/navigation');
    } catch {
      // Handle error silently - will show in UI
    }
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
              You have been assigned the following role(s): <strong>{user?.roles.join(', ')}</strong>
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
            {hasRole('captain') && (
              <Link to="/navigation" className="control-card navigation">
                <div className="card-icon">🗺️</div>
                <h4>Navigation</h4>
                <p>Control ship routing and set waypoints</p>
              </Link>
            )}

            {(hasRole('captain') || hasRole('engineer')) && (
              <Link to="/fuel" className="control-card fuel">
                <div className="card-icon">⛽</div>
                <h4>Fuel Management</h4>
                <p>Monitor and allocate fuel reserves</p>
              </Link>
            )}

            {(hasRole('captain') || hasRole('engineer')) && (
              <Link to="/diagnostics" className="control-card diagnostics">
                <div className="card-icon">📊</div>
                <h4>Ship Diagnostics</h4>
                <p>View system status and alerts</p>
              </Link>
            )}

            {!hasRole('captain') && !hasRole('engineer') && (
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
              {shipStatus?.navigation && <p><strong>ETA:</strong> {shipStatus.navigation.eta}</p>}
            </div>
            <div className="status-box">
              <h4>Fuel Reserves</h4>
              <p>
                <strong>Level:</strong>{' '}
                <span className={`fuel-level ${shipStatus && shipStatus.fuel.percentage > 50 ? 'good' : 'warning'}`}>
                  {shipStatus ? Math.round(shipStatus.fuel.percentage) : 0}%
                </span>
              </p>
              {shipStatus?.fuel && (
                <p><strong>Hours Remaining:</strong> {Math.round(shipStatus.fuel.hoursRemaining * 10) / 10}</p>
              )}
            </div>
            <div className="status-box">
              <h4>Ship Diagnostics</h4>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${shipStatus?.diagnostics.overallStatus === 'OPERATIONAL' ? 'operational' : 'warning'}`}>
                  {shipStatus?.diagnostics.overallStatus || 'Unknown'}
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
