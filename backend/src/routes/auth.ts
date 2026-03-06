import express, { Request, Response } from 'express';
import passport from 'passport';

const router = express.Router();

// Login endpoint - redirects to Keycloak
router.get('/login', passport.authenticate('openidconnect'));

// Callback from Keycloak
router.get(
  '/callback',
  passport.authenticate('openidconnect', {
    failureRedirect: '/auth/failure',
  }),
  (req: Request, res: Response) => {
    // Successful authentication
    res.redirect('http://localhost:3000/dashboard');
  }
);

// Logout endpoint
router.get('/logout', (req: Request, res: Response) => {
  const keycloakURL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
  const realm = process.env.KEYCLOAK_REALM || 'ship-portal';
  const logoutURL = `${keycloakURL}/realms/${realm}/protocol/openid-connect/logout`;

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect(
      `${logoutURL}?redirect_uri=${encodeURIComponent('http://localhost:3000')}`
    );
  });
});

// Failure endpoint
router.get('/failure', (req: Request, res: Response) => {
  res.status(401).json({ error: 'Authentication failed' });
});

export default router;
