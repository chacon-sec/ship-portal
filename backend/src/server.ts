/// <reference path="./types/passport-openidconnect.d.ts" />
/// <reference path="./types/express.d.ts" />
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureKeycloak, KeycloakUser, requireAuth } from './config/keycloak';
import authRoutes from './routes/auth';
import navigationRoutes from './routes/navigation';
import fuelRoutes from './routes/fuel';
import diagnosticsRoutes from './routes/diagnostics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ship-portal-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Passport configuration
passport.use(configureKeycloak());
passport.serializeUser((user: any, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);

type OperationRole = 'captain' | 'first_officer' | 'engineer' | 'crew_member';

interface OperationTask {
  id: string;
  title: string;
  description: string;
  requiredRole: OperationRole;
  completedBy?: string;
  completedAt?: string;
}

const operationTasks: OperationTask[] = [
  {
    id: 'captain-weather-brief',
    title: 'Approve weather reroute',
    description: 'Review weather report and approve route deviation for safety.',
    requiredRole: 'captain',
  },
  {
    id: 'captain-shift-briefing',
    title: 'Publish shift briefing',
    description: 'Send mission briefing to all bridge officers for the next watch.',
    requiredRole: 'captain',
  },
  {
    id: 'first-officer-watch-check',
    title: 'Run bridge watch checklist',
    description: 'Verify radar, communications, and lookouts for active watch.',
    requiredRole: 'first_officer',
  },
  {
    id: 'first-officer-drill-log',
    title: 'Log emergency drill',
    description: 'Record drill attendance and readiness notes for deck crew.',
    requiredRole: 'first_officer',
  },
  {
    id: 'engineer-cooling-audit',
    title: 'Audit cooling loop',
    description: 'Capture cooling pressure snapshots and confirm threshold compliance.',
    requiredRole: 'engineer',
  },
  {
    id: 'engineer-generator-test',
    title: 'Run generator load test',
    description: 'Execute 5-minute load test and store voltage/frequency results.',
    requiredRole: 'engineer',
  },
  {
    id: 'crew-safety-round',
    title: 'Complete deck safety round',
    description: 'Inspect deck equipment and report any obstruction or hazard.',
    requiredRole: 'crew_member',
  },
  {
    id: 'crew-cargo-seals',
    title: 'Verify cargo seals',
    description: 'Confirm seal integrity and note damaged or missing identifiers.',
    requiredRole: 'crew_member',
  },
];

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// root path - helpful when someone hits the backend directly
app.get('/', (req: Request, res: Response) => {
  // the backend doesn't serve the SPA; redirect to the frontend if possible
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res
    .status(302)
    .send(`This service is the API backend. Navigate to ${frontend} for the frontend.`);
});

// User info endpoint (authenticated)
app.get('/api/user', requireAuth, (req: Request, res: Response) => {
  const user = req.user as KeycloakUser;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  });
});

app.get('/api/operations/tasks', requireAuth, (req: Request, res: Response) => {
  const user = req.user as KeycloakUser;

  const tasks = operationTasks.map((task) => ({
    ...task,
    canExecute: (user.roles || []).includes(task.requiredRole),
  }));

  res.json({ tasks, userRoles: user.roles || [] });
});

app.post('/api/operations/tasks/:taskId/execute', requireAuth, (req: Request, res: Response) => {
  const user = req.user as KeycloakUser;
  const { taskId } = req.params;
  const task = operationTasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (!(user.roles || []).includes(task.requiredRole)) {
    return res.status(403).json({
      error: `You are not ${task.requiredRole} role and access denied`,
      requiredRole: task.requiredRole,
    });
  }

  task.completedBy = user.username;
  task.completedAt = new Date().toISOString();

  return res.json({ success: true, task });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error', err.stack || err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Ship Portal backend running on http://localhost:${PORT}`);
});
