import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest, UserRole } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Partial<User> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    const role = (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] ||
      'Customer'
    ) as UserRole;

    const idStr =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      payload['nameid'] ||
      payload['sub'] ||
      '0';
    const id = parseInt(idStr, 10);

    const email =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      payload['email'] ||
      '';

    const name =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload['name'] ||
      '';

    const centerId = payload['CenterId'] ? parseInt(payload['CenterId'], 10) : null;

    return { id, name, email, role, centerId };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');

      if (savedToken) {
        const decoded = decodeJwtPayload(savedToken);
        let parsedUser: Partial<User> = {};
        if (savedUserStr) {
          try {
            parsedUser = JSON.parse(savedUserStr);
          } catch {
            // Ignore corrupt JSON in user storage
          }
        }

        if (decoded && decoded.id) {
          const mergedUser: User = {
            id: decoded.id,
            name: decoded.name || parsedUser.name || '',
            email: decoded.email || parsedUser.email || '',
            role: decoded.role || (parsedUser.role as UserRole) || 'Customer',
            centerId: decoded.centerId !== undefined ? decoded.centerId : (parsedUser.centerId ?? null),
            createdAt: parsedUser.createdAt,
            isDeleted: parsedUser.isDeleted,
          };
          setToken(savedToken);
          setUser(mergedUser);
        } else if (savedUserStr) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserStr));
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    const authData = await authApi.login(credentials);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    return authData.user;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    const authData = await authApi.register(data);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    return authData.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
