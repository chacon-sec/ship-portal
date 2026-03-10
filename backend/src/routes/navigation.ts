import express, { Request, Response } from 'express';
import { requireAuth, requireRole, KeycloakUser } from '../config/keycloak';

const router = express.Router();

// Mock data for ship navigation
interface Route {
  id: string;
  name: string;
  waypoints: { lat: number; lng: number }[];
  distance: number;
  eta: string;
  status: 'active' | 'planned' | 'completed';
}

interface CrewAssignment {
  id: string;
  name: string;
  role: string;
  station: string;
  shift: string;
}

let shipRoute: Route = {
  id: '1',
  name: 'Current Route to Port A',
  waypoints: [
    { lat: 40.7128, lng: -74.006 },
    { lat: 40.758, lng: -73.9855 },
  ],
  distance: 150.5,
  eta: '14:30 UTC',
  status: 'active',
};

const crewAssignments: CrewAssignment[] = [
  { id: 'c1', name: 'M. Rivera', role: 'Helm', station: 'Bridge', shift: '00:00-04:00' },
  { id: 'c2', name: 'A. Patel', role: 'Radar', station: 'Bridge', shift: '04:00-08:00' },
  { id: 'c3', name: 'J. Kim', role: 'Deck Lead', station: 'Fore Deck', shift: '08:00-12:00' },
  { id: 'c4', name: 'L. Novak', role: 'Comms', station: 'Bridge', shift: '12:00-16:00' },
];

// Get current ship route (all authenticated users)
router.get('/', requireAuth, (req: Request, res: Response) => {
  res.json(shipRoute);
});

// Get route history (First Officer and above)
router.get('/history', requireAuth, requireRole(['captain', 'first_officer']), (req: Request, res: Response) => {
  res.json([
    { ...shipRoute, status: 'completed', eta: '08:00 UTC' },
    { ...shipRoute, id: '2', name: 'Previous Route', status: 'completed', eta: '06:00 UTC' },
  ]);
});

// Update/reroute ship (Captain only)
router.post('/reroute', requireAuth, requireRole(['captain']), (req: Request, res: Response) => {
  const { name, waypoints } = req.body;

  if (!name || !waypoints || !Array.isArray(waypoints)) {
    return res.status(400).json({ error: 'Invalid route data' });
  }

  shipRoute = {
    id: String(Date.now()),
    name,
    waypoints,
    distance: calculateDistance(waypoints),
    eta: calculateETA(),
    status: 'active',
  };

  const user = req.user as KeycloakUser;
  console.log(`Captain ${user.username} rerouted the ship to ${name}`);

  res.json(shipRoute);
});

// Get navigation diagnostics (First Officer and above)
router.get('/diagnostics', requireAuth, requireRole(['captain', 'first_officer']), (req: Request, res: Response) => {
  res.json({
    heading: 0o45,
    speed: 18.5,
    windSpeed: 12.0,
    windDirection: 270,
    visibility: 15000,
    seaState: 'moderate',
  });
});

// Get crew assignments (First Officer and Captain)
router.get('/crew-assignments', requireAuth, requireRole(['captain', 'first_officer']), (req: Request, res: Response) => {
  res.json({ assignments: crewAssignments });
});

// Helper functions
function calculateDistance(waypoints: { lat: number; lng: number }[]): number {
  // Simplified distance calculation
  return Math.random() * 200 + 100;
}

function calculateETA(): string {
  const date = new Date();
  date.setHours(date.getHours() + Math.random() * 24);
  return date.toLocaleTimeString('en-US', { hour12: false }) + ' UTC';
}

export default router;
