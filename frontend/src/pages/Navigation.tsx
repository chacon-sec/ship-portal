import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { ShipMap } from '../components/ShipMap';
import { PermissionError } from '../components/PermissionError';
import '../styles/Navigation.css';

interface Route {
  id: string;
  name: string;
  waypoints: { lat: number; lng: number }[];
  distance: number;
  eta: string;
  status: 'active' | 'planned' | 'completed';
}

export default function Navigation() {
  const { user, logout, hasRole } = useAuth();
  const { data: currentRoute, request: fetchRoute, post: updateRoute, isLoading, error } = useApi<Route>();
  const [newRouteName, setNewRouteName] = useState('');
  const [newWaypoints, setNewWaypoints] = useState<{ lat: number; lng: number }[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      await fetchRoute('/api/navigation');
    } catch {
      // Handle error silently
    }
  };

  const handleAddWaypoint = () => {
    setNewWaypoints([...newWaypoints, { lat: 40, lng: -74 }]);
  };

  const handleUpdateWaypoint = (index: number, lat: number, lng: number) => {
    const updated = [...newWaypoints];
    updated[index] = { lat, lng };
    setNewWaypoints(updated);
  };

  const handleRemoveWaypoint = (index: number) => {
    setNewWaypoints(newWaypoints.filter((_, i) => i !== index));
  };

  const handleSubmitRoute = async () => {
    if (!newRouteName || newWaypoints.length < 2) {
      alert('Please enter a route name and at least 2 waypoints');
      return;
    }

    try {
      await updateRoute('/api/navigation/reroute', {
        name: newRouteName,
        waypoints: newWaypoints,
      });
      setNewRouteName('');
      setNewWaypoints([]);
      setShowForm(false);
      await loadRoute();
      alert('Route updated successfully!');
    } catch (err) {
      alert('Failed to update route');
    }
  };

  if (!hasRole('captain')) {
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
          <PermissionError
            title="Navigation Control Restricted"
            message="You do not have permission to control ship navigation."
            requiredRoles={['captain']}
          />
        </div>
      </div>
    );
  }

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
        <h2 className="page-title">🗺️ Navigation Control Center</h2>

        {error && <div className="error-message">Error loading navigation data: {error.message}</div>}

        <div className="navigation-container">
          <div className="current-route">
            <h3>Current Route</h3>
            {isLoading ? (
              <p>Loading route...</p>
            ) : currentRoute ? (
              <div className="route-info">
                <h4>{currentRoute.name}</h4>
                <div className="route-details">
                  <p>
                    <strong>Distance:</strong> {currentRoute.distance.toFixed(1)} NM
                  </p>
                  <p>
                    <strong>ETA:</strong> {currentRoute.eta}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className="status-badge operational">{currentRoute.status}</span>
                  </p>
                  <p>
                    <strong>Waypoints:</strong> {currentRoute.waypoints.length}
                  </p>
                </div>

                <div className="map-container">
                  <ShipMap
                    waypoints={currentRoute.waypoints}
                    currentPosition={currentRoute.waypoints[0]}
                  />
                </div>
              </div>
            ) : (
              <p>No active route</p>
            )}
          </div>

          <div className="reroute-section">
            <h3>Reroute Ship</h3>
            {showForm ? (
              <div className="reroute-form">
                <div className="form-group">
                  <label htmlFor="route-name">Route Name:</label>
                  <input
                    id="route-name"
                    type="text"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    placeholder="Enter new route name"
                  />
                </div>

                <div className="waypoints-section">
                  <h4>Waypoints</h4>
                  {newWaypoints.map((wp, idx) => (
                    <div key={idx} className="waypoint-input">
                      <input
                        type="number"
                        step="0.01"
                        value={wp.lat}
                        onChange={(e) => handleUpdateWaypoint(idx, parseFloat(e.target.value), wp.lng)}
                        placeholder="Latitude"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={wp.lng}
                        onChange={(e) => handleUpdateWaypoint(idx, wp.lat, parseFloat(e.target.value))}
                        placeholder="Longitude"
                      />
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveWaypoint(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button className="add-waypoint-btn" onClick={handleAddWaypoint}>
                    + Add Waypoint
                  </button>
                </div>

                <div className="map-container">
                  <ShipMap waypoints={newWaypoints} editable={true} />
                </div>

                <div className="form-actions">
                  <button className="submit-btn" onClick={handleSubmitRoute}>
                    Confirm Reroute
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setNewRouteName('');
                      setNewWaypoints([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="reroute-btn" onClick={() => setShowForm(true)}>
                Initiate Reroute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
