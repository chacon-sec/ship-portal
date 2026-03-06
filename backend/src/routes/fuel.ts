import express, { Request, Response } from 'express';
import { requireAuth, requireRole, KeycloakUser } from '../config/keycloak';

const router = express.Router();

// Mock fuel data
interface FuelTank {
  id: string;
  name: string;
  capacity: number;
  current: number;
  consumptionRate: number; // liters per hour
}

let fuelTanks: FuelTank[] = [
  { id: '1', name: 'Main Tank', capacity: 50000, current: 45000, consumptionRate: 120 },
  { id: '2', name: 'Reserve Tank', capacity: 20000, current: 18000, consumptionRate: 50 },
  { id: '3', name: 'Auxiliary Tank', capacity: 10000, current: 8000, consumptionRate: 30 },
];

// Get fuel status (all authenticated users)
router.get('/', requireAuth, (req: Request, res: Response) => {
  const totalCapacity = fuelTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalCurrent = fuelTanks.reduce((sum, tank) => sum + tank.current, 0);
  const totalConsumption = fuelTanks.reduce((sum, tank) => sum + tank.consumptionRate, 0);

  res.json({
    tanks: fuelTanks,
    summary: {
      totalCapacity,
      totalCurrent,
      percentageFull: (totalCurrent / totalCapacity) * 100,
      totalConsumptionRate: totalConsumption,
      hoursRemaining: totalCurrent / totalConsumption,
    },
  });
});

// Get fuel consumption history (Engineer and above)
router.get('/history', requireAuth, requireRole(['captain', 'engineer']), (req: Request, res: Response) => {
  res.json({
    history: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), consumption: 200 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), consumption: 220 },
      { timestamp: new Date(Date.now() - 10800000).toISOString(), consumption: 210 },
    ],
  });
});

// Allocate fuel to specific tank (Captain only)
router.post('/allocate', requireAuth, requireRole(['captain']), (req: Request, res: Response) => {
  const { tankId, amount } = req.body;

  const tank = fuelTanks.find((t) => t.id === tankId);
  if (!tank) {
    return res.status(404).json({ error: 'Tank not found' });
  }

  const newAmount = tank.current + amount;
  if (newAmount > tank.capacity) {
    return res.status(400).json({ error: 'Tank capacity exceeded' });
  }

  tank.current = newAmount;

  const user = req.user as KeycloakUser;
  console.log(`Captain ${user.username} allocated ${amount}L to ${tank.name}`);

  res.json(tank);
});

// Request fuel reallocation (First Officer and Engineer)
router.post('/request-reallocation', requireAuth, requireRole(['captain', 'first_officer', 'engineer']), (req: Request, res: Response) => {
  const { fromTankId, toTankId, amount } = req.body;

  const fromTank = fuelTanks.find((t) => t.id === fromTankId);
  const toTank = fuelTanks.find((t) => t.id === toTankId);

  if (!fromTank || !toTank) {
    return res.status(404).json({ error: 'Tank not found' });
  }

  if (fromTank.current < amount) {
    return res.status(400).json({ error: 'Insufficient fuel in source tank' });
  }

  if (toTank.current + amount > toTank.capacity) {
    return res.status(400).json({ error: 'Destination tank capacity exceeded' });
  }

  fromTank.current -= amount;
  toTank.current += amount;

  const user = req.user as KeycloakUser;
  console.log(`${user.username} reallocated ${amount}L from ${fromTank.name} to ${toTank.name}`);

  res.json({
    success: true,
    fromTank,
    toTank,
  });
});

export default router;
