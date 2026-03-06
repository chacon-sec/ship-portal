import express, { Request, Response } from 'express';
import { requireAuth, requireRole, KeycloakUser } from '../config/keycloak';

const router = express.Router();

// Mock ship diagnostics data
interface SystemStatus {
  name: string;
  status: 'operational' | 'warning' | 'critical';
  value: number;
  unit: string;
}

let diagnostics = {
  engine: {
    temperature: { name: 'Engine Temperature', status: 'operational' as const, value: 85, unit: '°C' },
    rpm: { name: 'RPM', status: 'operational' as const, value: 2800, unit: 'RPM' },
    oilPressure: { name: 'Oil Pressure', status: 'operational' as const, value: 75, unit: 'PSI' },
  },
  hull: {
    integrity: { name: 'Hull Integrity', status: 'operational' as const, value: 98, unit: '%' },
    waterLevel: { name: 'Water Level', status: 'operational' as const, value: 0.5, unit: 'm' },
  },
  electrical: {
    voltage: { name: 'Main Voltage', status: 'operational' as const, value: 440, unit: 'V' },
    frequency: { name: 'Frequency', status: 'operational' as const, value: 60, unit: 'Hz' },
  },
};

let alerts: any[] = [];

// Get all diagnostics (all authenticated users - read only)
router.get('/', requireAuth, (req: Request, res: Response) => {
  res.json(diagnostics);
});

// Get full diagnostics report (Captain and Engineer)
router.get('/report', requireAuth, requireRole(['captain', 'engineer']), (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    systemDiagnostics: diagnostics,
    alerts: alerts.slice(-10), // Last 10 alerts
    overallStatus: calculateOverallStatus(),
  });
});

// Get alert history (Engineer and above)
router.get('/alerts', requireAuth, requireRole(['captain', 'engineer']), (req: Request, res: Response) => {
  res.json(alerts.slice(-20)); // Last 20 alerts
});

// Update diagnostics (Engineer only)
router.post('/update', requireAuth, requireRole(['engineer']), (req: Request, res: Response) => {
  const { system, metric, value, status } = req.body;

  // Navigate to the correct system and metric
  const systemObj = (diagnostics as any)[system];
  if (!systemObj || !systemObj[metric]) {
    return res.status(400).json({ error: 'Invalid system or metric' });
  }

  const oldValue = systemObj[metric].value;
  systemObj[metric].value = value;
  systemObj[metric].status = status || 'operational';

  const user = req.user as KeycloakUser;
  const alert = {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    user: user.username,
    system,
    metric,
    oldValue,
    newValue: value,
    status: systemObj[metric].status,
  };

  alerts.push(alert);
  console.log(`Engineer ${user.username} updated ${system}.${metric} from ${oldValue} to ${value}`);

  res.json({
    success: true,
    diagnostic: systemObj[metric],
    alert,
  });
});

// Clear critical alerts (Captain only)
router.post('/clear-alerts', requireAuth, requireRole(['captain']), (req: Request, res: Response) => {
  const clearedCount = alerts.filter((a) => a.status === 'critical').length;
  alerts = alerts.filter((a) => a.status !== 'critical');

  const user = req.user as KeycloakUser;
  console.log(`Captain ${user.username} cleared ${clearedCount} critical alerts`);

  res.json({ clearedCount, remainingAlerts: alerts.length });
});

function calculateOverallStatus(): string {
  const allMetrics = [
    ...Object.values((diagnostics as any).engine),
    ...Object.values((diagnostics as any).hull),
    ...Object.values((diagnostics as any).electrical),
  ] as SystemStatus[];

  if (allMetrics.some((m) => m.status === 'critical')) return 'CRITICAL';
  if (allMetrics.some((m) => m.status === 'warning')) return 'WARNING';
  return 'OPERATIONAL';
}

export default router;
