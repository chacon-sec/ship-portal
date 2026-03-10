import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    fetchUser();

    // Keep session roles in sync with backend updates from Keycloak.
    const refreshIntervalMs = 15000;
    const interval = window.setInterval(() => {
      fetchUser();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/user`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // compute base url at runtime if variable is missing (helps container builds)
  // Vite exposes env vars via import.meta.env
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:5000`;

  const login = () => {
    // navigate directly to backend so we don't hit the SPA router or dev server
    window.location.href = `${apiBase}/auth/login`;
  };

  const logout = () => {
    window.location.href = `${apiBase}/auth/logout`;
  };

  const hasRole = (role: string) => {
    return (user?.roles ?? []).includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
