import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { Request, Response, NextFunction } from 'express';

export interface KeycloakUser extends Express.User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}

export const configureKeycloak = () => {
  const keycloakURL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
  const realm = process.env.KEYCLOAK_REALM || 'ship-portal';
  const clientID = process.env.KEYCLOAK_CLIENT_ID || 'ship-portal-client';

  const issuer = `${keycloakURL}/realms/${realm}`;
  const authorizationURL = `${issuer}/protocol/openid-connect/auth`;
  const tokenURL = `${issuer}/protocol/openid-connect/token`;
  const userInfoURL = `${issuer}/protocol/openid-connect/userinfo`;

  return new OpenIDConnectStrategy(
    {
      issuer,
      authorizationURL,
      tokenURL,
      userInfoURL,
      clientID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'secret',
      callbackURL: 'http://localhost:5000/auth/callback',
      scope: ['openid', 'profile', 'email'],
    },
    (issuer: string, sub: string, profile: any, accessToken: string, refreshToken: string, done: any) => {
      const user: KeycloakUser = {
        id: sub,
        username: profile.displayName || profile.username || sub,
        email: profile.emails?.[0]?.value,
        roles: profile.groups || [],
      };
      return done(null, user);
    }
  );
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRoles = (req.user as KeycloakUser).roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};
