/// <reference path="../types/passport-openidconnect.d.ts" />
/// <reference path="../types/express.d.ts" />
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { Request, Response, NextFunction } from 'express';

export interface KeycloakUser extends Express.User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}

export const configureKeycloak = () => {
  // URL that the server will use to talk to Keycloak (container network)
  const keycloakURL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
  // public address forwarded to browsers; usually localhost in development
  const publicKeycloakURL =
    process.env.PUBLIC_KEYCLOAK_URL ||
    keycloakURL.replace('http://keycloak:8080', 'http://localhost:8080');

  const realm = process.env.KEYCLOAK_REALM || 'ship-portal';
  const clientID = process.env.KEYCLOAK_CLIENT_ID || 'ship-portal-client';

  // the token issuer claim is based on the public URL (what the browser sees),
  // so we use publicKeycloakURL when validating tokens and for the strategy's issuer.
  const issuer = `${publicKeycloakURL}/realms/${realm}`;
  const authorizationURL = `${publicKeycloakURL}/realms/${realm}/protocol/openid-connect/auth`;
  // but the backend should still post to the internal service address for token/userinfo
  const tokenURL = `${keycloakURL}/realms/${realm}/protocol/openid-connect/token`;
  const userInfoURL = `${keycloakURL}/realms/${realm}/protocol/openid-connect/userinfo`;

  const decodeJwtClaims = (token?: string): Record<string, any> | null => {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch {
      return null;
    }
  };

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
    // passport-openidconnect's verify callback shape varies by strategy internals,
    // so we normalize arguments defensively to avoid malformed users in session.
    (issuer: string, profile: any, context: any, idToken: string, accessToken: string, refreshToken: string, done: any) => {
      const claimsFromIdToken = decodeJwtClaims(idToken) || {};
      const claimsFromAccessToken = decodeJwtClaims(accessToken) || {};

      const realmRoles: string[] = [
        ...(profile?.realm_access?.roles || []),
        ...(claimsFromIdToken.realm_access?.roles || []),
        ...(claimsFromAccessToken.realm_access?.roles || []),
      ];

      const clientRoles: string[] = [
        ...(profile?.resource_access?.[clientID]?.roles || []),
        ...(claimsFromIdToken.resource_access?.[clientID]?.roles || []),
        ...(claimsFromAccessToken.resource_access?.[clientID]?.roles || []),
      ];

      const groups: string[] = [
        ...(profile?.groups || []),
        ...(claimsFromIdToken.groups || []),
        ...(claimsFromAccessToken.groups || []),
      ];

      const userId =
        profile?.id ||
        profile?.sub ||
        claimsFromIdToken.sub ||
        claimsFromAccessToken.sub ||
        '';

      const username =
        profile?.username ||
        profile?.displayName ||
        profile?.name?.givenName ||
        claimsFromIdToken.preferred_username ||
        claimsFromAccessToken.preferred_username ||
        userId;

      const email =
        profile?.emails?.[0]?.value ||
        claimsFromIdToken.email ||
        claimsFromAccessToken.email;

      const allRoles = [...new Set([...realmRoles, ...clientRoles, ...groups])];

      const user: KeycloakUser = {
        id: String(userId),
        username: String(username),
        email,
        roles: allRoles.filter((role) => typeof role === 'string'),
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
