import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { FuelGauge } from '../components/FuelGauge';
import { PermissionError } from '../components/PermissionError';
import '../styles/Fuel.css';

interface FuelTank {
  id: string;
  name: string;
  capacity: number;
  current: number;
  consumptionRate: number;
}

interface FuelData {
  tanks: FuelTank[];
  summary: {
    totalCapacity: number;
    totalCurrent: number;
    percentageFull: number;
    totalConsumptionRate: number;
    hoursRemaining: number;
  };
}

export default function Fuel() {
  const { user, logout, hasRole } = useAuth();
  const canAccessFuel = hasRole('captain') || hasRole('first_officer') || hasRole('engineer');
  const { data: fuelData, request: fetchFuel, post: allocateFuel, isLoading, error } = useApi<FuelData>();
  const [fromTankId, setFromTankId] = useState('');
  const [toTankId, setToTankId] = useState('');
  const [amount, setAmount] = useState('');
  const [allocateMode, setAllocateMode] = useState(false);

  useEffect(() => {
    loadFuel();
  }, []);

  const loadFuel = async () => {
    try {
      await fetchFuel('/api/fuel');
    } catch {
      // Handle error silently
    }
  };

  const handleAllocateFuel = async () => {
    if (!fromTankId || !toTankId || !amount) {
      alert('Please select tanks and enter amount');
      return;
    }

    try {
      await allocateFuel('/api/fuel/request-reallocation', {
        fromTankId,
        toTankId,
        amount: parseFloat(amount),
      });
      setFromTankId('');
      setToTankId('');
      setAmount('');
      setAllocateMode(false);
      await loadFuel();
      alert('Fuel reallocated successfully!');
    } catch (err) {
      alert('Failed to reallocate fuel');
    }
  };

  if (!canAccessFuel) {
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
          <PermissionError
            title="Fuel Management Restricted"
            message="You are not captain, first_officer, or engineer role and access denied"
            requiredRoles={['captain', 'first_officer', 'engineer']}
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
        <h2 className="page-title">⛽ Fuel Command Center</h2>

        {error && <div className="error-message">Error loading fuel data: {error.message}</div>}

        {isLoading ? (
          <p>Loading fuel data...</p>
        ) : fuelData ? (
          <>
            <div className="fuel-summary">
              <h3>Fuel Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Capacity</span>
                  <span className="summary-value">{fuelData.summary.totalCapacity.toLocaleString()} L</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Current Level</span>
                  <span className="summary-value" style={{ color: '#00ff00' }}>
                    {fuelData.summary.totalCurrent.toLocaleString()} L
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Percentage Full</span>
                  <span className="summary-value" style={{ color: '#00d4ff' }}>
                    {Math.round(fuelData.summary.percentageFull)}%
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Consumption Rate</span>
                  <span className="summary-value">{fuelData.summary.totalConsumptionRate} L/hr</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Hours Remaining</span>
                  <span
                    className="summary-value"
                    style={{
                      color: fuelData.summary.hoursRemaining > 24 ? '#00ff00' : '#ffaa00',
                    }}
                  >
                    {Math.round(fuelData.summary.hoursRemaining * 10) / 10} hours
                  </span>
                </div>
              </div>
            </div>

            <div className="fuel-tanks">
              <h3>Fuel Tanks</h3>
              <div className="tanks-grid">
                {fuelData.tanks.map((tank) => (
                  <FuelGauge
                    key={tank.id}
                    current={tank.current}
                    capacity={tank.capacity}
                    name={tank.name}
                    consumptionRate={tank.consumptionRate}
                  />
                ))}
              </div>
            </div>

            {(hasRole('captain') || hasRole('first_officer') || hasRole('engineer')) && (
              <div className="fuel-allocation">
                <h3>Fuel Reallocation</h3>
                {allocateMode ? (
                  <div className="allocation-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="from-tank">From Tank:</label>
                        <select
                          id="from-tank"
                          value={fromTankId}
                          onChange={(e) => setFromTankId(e.target.value)}
                        >
                          <option value="">Select tank</option>
                          {fuelData.tanks.map((tank) => (
                            <option key={tank.id} value={tank.id}>
                              {tank.name} ({tank.current}L / {tank.capacity}L)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="to-tank">To Tank:</label>
                        <select
                          id="to-tank"
                          value={toTankId}
                          onChange={(e) => setToTankId(e.target.value)}
                        >
                          <option value="">Select tank</option>
                          {fuelData.tanks.map((tank) => (
                            <option key={tank.id} value={tank.id}>
                              {tank.name} ({tank.current}L / {tank.capacity}L)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="amount">Amount (L):</label>
                        <input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="submit-btn" onClick={handleAllocateFuel}>
                        Reallocate Fuel
                      </button>
                      <button className="cancel-btn" onClick={() => setAllocateMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="allocate-btn" onClick={() => setAllocateMode(true)}>
                    Reallocate Fuel Between Tanks
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p>No fuel data available</p>
        )}
      </div>
    </div>
  );
}
