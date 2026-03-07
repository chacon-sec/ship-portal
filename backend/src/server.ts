/// <reference path="./types/passport-openidconnect.d.ts" />
/// <reference path="./types/express.d.ts" />
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureKeycloak, KeycloakUser } from './config/keycloak';
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
app.get('/api/user', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.user);
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error', err.stack || err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Ship Portal backend running on http://localhost:${PORT}`);
});
