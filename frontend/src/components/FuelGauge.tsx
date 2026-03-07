interface FuelGaugeProps {
  current: number;
  capacity: number;
  name: string;
  consumptionRate?: number;
}

export function FuelGauge({ current, capacity, name, consumptionRate }: FuelGaugeProps) {
  const percentage = (current / capacity) * 100;
  const getColor = () => {
    if (percentage > 50) return '#00ff00';
    if (percentage > 25) return '#ffaa00';
    return '#ff0000';
  };

  const hoursRemaining = consumptionRate ? current / consumptionRate : null;

  return (
    <div className="fuel-gauge">
      <h4>{name}</h4>
      <div className="gauge-container">
        <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: '200px' }}>
          {/* Background gauge */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          {/* Filled gauge */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 251} 251`}
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
          {/* Percentage text */}
          <text
            x="100"
            y="70"
            textAnchor="middle"
            fontSize="32"
            fill={getColor()}
            fontWeight="bold"
          >
            {Math.round(percentage)}%
          </text>
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontSize="12"
            fill="#888"
          >
            {Math.round(current)}L / {capacity}L
          </text>
        </svg>
      </div>
      {hoursRemaining !== null && (
        <div className="gauge-info">
          <p>Consumption: {consumptionRate} L/hr</p>
          <p>Hours remaining: {Math.round(hoursRemaining * 10) / 10}</p>
        </div>
      )}
    </div>
  );
}
