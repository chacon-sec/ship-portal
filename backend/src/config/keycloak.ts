/// <reference path="../types/passport-openidconnect.d.ts" />
/// <reference path="../types/express.d.ts" />
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { Request, Response, NextFunction } from 'express';

export interface KeycloakUser extends Express.User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  rolesRefreshedAt?: number;
}

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

const getRolesFromClaims = (claims: Record<string, any> | null, clientID: string): string[] => {
  if (!claims) {
    return [];
  }

  const realmRoles: string[] = claims.realm_access?.roles || [];
  const clientRoles: string[] = claims.resource_access?.[clientID]?.roles || [];
  const groups: string[] = claims.groups || [];

  return [...new Set([...realmRoles, ...clientRoles, ...groups])].filter(
    (role) => typeof role === 'string'
  );
};

const updateSessionUser = (req: Request, user: KeycloakUser) => {
  req.user = user;
  if (req.session?.passport) {
    req.session.passport.user = user;
  }
};

const REQUEST_ROLES_SYNCED_FLAG = '__rolesSynced';

export const refreshUserRolesFromKeycloak = async (
  user: KeycloakUser
): Promise<KeycloakUser> => {
  if (!user?.refreshToken) {
    return user;
  }

  const minRefreshIntervalMs = Number(process.env.ROLE_REFRESH_MIN_INTERVAL_MS || '10000');
  if (
    user.rolesRefreshedAt &&
    Date.now() - user.rolesRefreshedAt < Math.max(0, minRefreshIntervalMs)
  ) {
    return user;
  }

  const keycloakURL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
  const realm = process.env.KEYCLOAK_REALM || 'ship-portal';
  const clientID = process.env.KEYCLOAK_CLIENT_ID || 'ship-portal-client';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || 'secret';
  const tokenURL = `${keycloakURL}/realms/${realm}/protocol/openid-connect/token`;

  try {
    const tokenBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.refreshToken,
      client_id: clientID,
      client_secret: clientSecret,
    });

    const response = await fetch(tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody.toString(),
    });

    if (!response.ok) {
      console.warn('Failed to refresh Keycloak token for role sync', response.status);
      return {
        ...user,
        rolesRefreshedAt: Date.now(),
      };
    }

    const tokenResponse = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

    if (!tokenResponse.access_token) {
      return {
        ...user,
        rolesRefreshedAt: Date.now(),
      };
    }

    const accessClaims = decodeJwtClaims(tokenResponse.access_token);

    return {
      ...user,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || user.refreshToken,
      tokenExpiresAt: accessClaims?.exp ? Number(accessClaims.exp) * 1000 : user.tokenExpiresAt,
      roles: getRolesFromClaims(accessClaims, clientID),
      rolesRefreshedAt: Date.now(),
    };
  } catch (error) {
    console.warn('Error while refreshing roles from Keycloak', error);
    return {
      ...user,
      rolesRefreshedAt: Date.now(),
    };
  }
};

const syncRolesForRequest = async (req: Request) => {
  const requestWithFlag = req as Request & Record<string, any>;
  if (requestWithFlag[REQUEST_ROLES_SYNCED_FLAG]) {
    return;
  }

  requestWithFlag[REQUEST_ROLES_SYNCED_FLAG] = true;

  if (!req.user) {
    return;
  }

  const refreshedUser = await refreshUserRolesFromKeycloak(req.user as KeycloakUser);
  updateSessionUser(req, refreshedUser);
};

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
        accessToken,
        refreshToken,
        tokenExpiresAt: claimsFromAccessToken.exp
          ? Number(claimsFromAccessToken.exp) * 1000
          : undefined,
        rolesRefreshedAt: Date.now(),
      };

      return done(null, user);
    }
  );
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    await syncRolesForRequest(req);

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return next();
  })().catch((error) => {
    next(error);
  });
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      await syncRolesForRequest(req);

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userRoles = (req.user as KeycloakUser).roles || [];
      const hasRole = roles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      return next();
    })().catch((error) => {
      next(error);
    });
  };
};
