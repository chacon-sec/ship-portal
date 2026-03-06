import { useAuth } from '../hooks/useAuth';

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

// Add styles for Login page
const loginStyles = `
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  padding: 20px;
}

.login-box {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00d4ff;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  color: #00d4ff;
  font-size: 2em;
  margin: 0 0 10px 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.login-header p {
  color: #888;
  margin: 0;
}

.login-content {
  text-align: center;
}

.ship-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.login-content h2 {
  color: #fff;
  font-size: 1.8em;
  margin: 20px 0;
}

.login-content > p {
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 30px;
}

.login-button {
  background: linear-gradient(135deg, #00d4ff 0%, #00aaff 100%);
  color: #000;
  border: none;
  padding: 15px 40px;
  font-size: 1.1em;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.login-info {
  background: rgba(0, 212, 255, 0.05);
  border-left: 4px solid #00d4ff;
  padding: 20px;
  border-radius: 4px;
  text-align: left;
  margin-bottom: 30px;
}

.login-info h3 {
  color: #00d4ff;
  margin-top: 0;
}

.login-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.login-info li {
  color: #aaa;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.login-info li:last-child {
  border-bottom: none;
}

.login-roles {
  text-align: left;
  margin-top: 30px;
}

.login-roles h3 {
  color: #00d4ff;
  text-align: center;
  margin-bottom: 20px;
}

.role-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.role-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.role-item p {
  color: #aaa;
  font-size: 0.9em;
  margin: 10px 0 0 0;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85em;
  text-transform: uppercase;
}

.role-badge.captain {
  background: rgba(255, 170, 0, 0.2);
  color: #ffaa00;
}

.role-badge.first-officer {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}

.role-badge.engineer {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.role-badge.crew {
  background: rgba(128, 128, 128, 0.2);
  color: #aaa;
}

@media (max-width: 600px) {
  .login-box {
    padding: 20px;
  }

  .login-header h1 {
    font-size: 1.5em;
  }

  .role-list {
    grid-template-columns: 1fr;
  }
}
`;

export const loginStyleSheet = loginStyles;
