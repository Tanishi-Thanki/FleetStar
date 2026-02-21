import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, USERS, PERMISSIONS } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  hasPermission: (action: string) => boolean;
  canEditVehicleInRegion: (vehicleRegion: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    const found = USERS.find(u => u.email === email && u.password === password && u.role === role);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const hasPermission = useCallback((action: string): boolean => {
    if (!user) return false;
    const perms = PERMISSIONS[user.role];
    return perms[action] === true;
  }, [user]);

  const canEditVehicleInRegion = useCallback((vehicleRegion: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Fleet Manager') return user.region === vehicleRegion;
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canEditVehicleInRegion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
