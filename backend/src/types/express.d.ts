import 'express-session';

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email?: string;
      roles: string[];
    }

    interface Request {
      user?: User;
      logout(callback?: (err?: Error) => void): void;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: any;
    };
  }
}
