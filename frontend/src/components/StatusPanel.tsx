import React from 'react';

interface StatusItem {
  name: string;
  status: 'operational' | 'warning' | 'critical';
  value: number;
  unit: string;
}

interface StatusPanelProps {
  title: string;
  items: StatusItem[];
}

export function StatusPanel({ title, items }: StatusPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return '#00ff00';
      case 'warning':
        return '#ffaa00';
      case 'critical':
        return '#ff0000';
      default:
        return '#888';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'rgba(0, 255, 0, 0.1)';
      case 'warning':
        return 'rgba(255, 170, 0, 0.1)';
      case 'critical':
        return 'rgba(255, 0, 0, 0.1)';
      default:
        return 'rgba(100, 100, 100, 0.1)';
    }
  };

  return (
    <div className="status-panel">
      <h3>{title}</h3>
      <div className="status-items">
        {items.map((item, index) => (
          <div
            key={index}
            className="status-item"
            style={{ borderLeft: `4px solid ${getStatusColor(item.status)}` }}
          >
            <div className="status-item-header">
              <span className="status-name">{item.name}</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: getStatusBgColor(item.status),
                  color: getStatusColor(item.status),
                }}
              >
                {item.status.toUpperCase()}
              </span>
            </div>
            <div className="status-item-value">
              {item.value} <span className="unit">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add styles for StatusPanel
const statusPanelStyles = `
.status-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.status-panel h3 {
  margin-top: 0;
  color: #00d4ff;
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.status-item:hover {
  background: rgba(0, 0, 0, 0.5);
}

.status-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-name {
  font-weight: 500;
  color: #fff;
}

.status-badge {
  font-size: 0.75em;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: 600;
}

.status-item-value {
  font-size: 1.5em;
  font-weight: 600;
  color: #00d4ff;
}

.unit {
  font-size: 0.7em;
  color: #888;
  margin-left: 4px;
}
`;

export const statusPanelStyleSheet = statusPanelStyles;
