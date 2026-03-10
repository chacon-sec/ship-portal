import express, { Request, Response } from 'express';
import passport from 'passport';

const router = express.Router();

// Login endpoint - redirects to Keycloak
// clear any leftover user state and force a fresh login prompt
router.get('/login', (req: Request, res: Response, next: any) => {
  // regenerate session to clear previous state/nonce while still providing a session object
  req.session?.regenerate((err) => {
    if (err) {
      console.error('session regenerate error', err);
    }
    passport.authenticate('openidconnect', { prompt: 'login' }, (err: any) => {
      if (err) {
        console.error('passport.authenticate failed', err);
        return next(err);
      }
    })(req, res, next);
  });
});

// Callback from Keycloak
router.get(
  '/callback',
  (req: Request, res, next) => {
    console.log('callback hit', { query: req.query, session: req.sessionID });    console.log('session contents', JSON.stringify(req.session, null, 2));    // if Keycloak returned nothing (e.g. user reset password/updated profile)
    // just restart the auth flow instead of treating it as an error
    if (!req.query || Object.keys(req.query).length === 0) {
      console.warn('empty callback – restarting login flow');
      return res.redirect('/auth/login');
    }
    next();
  },
  (req: Request, res: Response, next: any) => {
    passport.authenticate('openidconnect', (err: any, user: any, info: any) => {
      console.log('passport callback result', { err, user, info });
      if (err) {
        console.error('passport error', err);
        return next(err);
      }
      if (!user) {
        console.warn('passport did not return a user, redirecting to failure', info);
        return res.redirect('/auth/failure');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('login error', loginErr);
          return next(loginErr);
        }
        next();
      });
    })(req, res, next);
  },
  (req: Request, res: Response) => {
    // Successful authentication
    const frontendHost = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendHost}/dashboard`);
  }
);

// Logout endpoint
router.get('/logout', (req: Request, res: Response) => {
  const keycloakURL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
  const publicKeycloakURL =
    process.env.PUBLIC_KEYCLOAK_URL ||
    keycloakURL.replace('http://keycloak:8080', 'http://localhost:8080');
  const realm = process.env.KEYCLOAK_REALM || 'ship-portal';
  const logoutURL = `${publicKeycloakURL}/realms/${realm}/protocol/openid-connect/logout`;

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect(
      `${logoutURL}?redirect_uri=${encodeURIComponent('http://localhost:3000')}`
    );
  });
});
// Failure endpoint (log parameters for debugging)
router.get('/failure', (req: Request, res: Response) => {
  console.error('authentication failure', { query: req.query, session: req.sessionID });
  res.status(401).json({
    error: 'Authentication failed',
    details: req.query,
  });
});

export default router;
