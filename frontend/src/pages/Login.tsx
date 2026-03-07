import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="container login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>⚓ Ship Navigation Portal</h1>
          <p>Identity & Access Management Lab</p>
        </div>

        <div className="login-content">
          <div className="ship-icon">🚢</div>
          <h2>Welcome Aboard, Captain</h2>
          <p>
            This portal demonstrates identity and access management through Keycloak.
            Your access is controlled by your assigned roles.
          </p>

          <button className="login-button" onClick={login}>
            Login with Keycloak
          </button>

          <div className="login-info">
            <h3>About This Lab</h3>
            <ul>
              <li><strong>Navigation:</strong> Control ship routing and waypoints</li>
              <li><strong>Fuel Management:</strong> Monitor and allocate fuel</li>
              <li><strong>Ship Diagnostics:</strong> View system status and alerts</li>
              <li><strong>Role-Based Access:</strong> Features vary by role</li>
            </ul>
          </div>

          <div className="login-roles">
            <h3>Available Roles</h3>
            <div className="role-list">
              <div className="role-item">
                <span className="role-badge captain">Captain</span>
                <p>Full access to all features</p>
              </div>
              <div className="role-item">
                <span className="role-badge first-officer">First Officer</span>
                <p>Navigation and diagnostics viewing</p>
              </div>
              <div className="role-item">
                <span className="role-badge engineer">Engineer</span>
                <p>Diagnostics and fuel management</p>
              </div>
              <div className="role-item">
                <span className="role-badge crew">Crew Member</span>
                <p>Read-only access to status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
