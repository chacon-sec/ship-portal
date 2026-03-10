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
                <p>Full access to all features, including Operations tasks</p>
              </div>
              <div className="role-item">
                <span className="role-badge first-officer">First Officer</span>
                <p>Dashboard and Operations tasks for bridge watch</p>
              </div>
              <div className="role-item">
                <span className="role-badge engineer">Engineer</span>
                <p>Fuel, diagnostics, and engineering Operations tasks</p>
              </div>
              <div className="role-item">
                <span className="role-badge crew">Crew Member</span>
                <p>Dashboard and crew Operations tasks</p>
              </div>
            </div>
          </div>

          <div className="login-access-map">
            <h3>Role Access Paths</h3>
            <div className="access-list">
              <div className="access-item">
                <h4>Captain</h4>
                <p>/dashboard, /navigation, /fuel, /diagnostics, /operations</p>
                <p className="denied-copy">If not captain: You are not captain role and access denied</p>
              </div>
              <div className="access-item">
                <h4>First Officer</h4>
                <p>/dashboard, /operations</p>
                <p className="denied-copy">If not first_officer: You are not first_officer role and access denied</p>
              </div>
              <div className="access-item">
                <h4>Engineer</h4>
                <p>/dashboard, /fuel, /diagnostics, /operations</p>
                <p className="denied-copy">If not engineer: You are not engineer role and access denied</p>
              </div>
              <div className="access-item">
                <h4>Crew Member</h4>
                <p>/dashboard, /operations</p>
                <p className="denied-copy">If not crew_member: You are not crew_member role and access denied</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
