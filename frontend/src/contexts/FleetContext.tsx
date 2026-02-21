import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Vehicle, Driver, Trip, MaintenanceRecord, AuditLog, SupportTicket,
  INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_TRIPS, INITIAL_MAINTENANCE, INITIAL_AUDIT_LOGS,
} from '@/data/mockData';
import { useAuth } from './AuthContext';

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLog[];
  tickets: SupportTicket[];
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  addVehicle: (v: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => void;
  updateDriver: (id: string, data: Partial<Driver>) => void;
  addTrip: (t: Trip) => Promise<void>;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  addMaintenance: (m: MaintenanceRecord) => void;
  updateMaintenance: (id: string, data: Partial<MaintenanceRecord>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addTicket: (t: Omit<SupportTicket, 'id' | 'createdAt'>) => void;
  updateTicket: (id: string, data: Partial<SupportTicket>) => void;
  loading: boolean;
  error: string | null;
  isUsingMockData: boolean;
}

const FleetContext = createContext<FleetContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL;

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!API_URL) {
      console.warn("VITE_API_URL not found, using mock data.");
      setIsUsingMockData(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [vRes, dRes, tRes] = await Promise.all([
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/drivers`),
        fetch(`${API_URL}/trips`),
      ]);

      if (!vRes.ok || !dRes.ok || !tRes.ok) {
        throw new Error("Failed to fetch from one or more endpoints");
      }

      const [vData, dData, tData] = await Promise.all([
        vRes.json(),
        dRes.json(),
        tRes.json(),
      ]);

      setVehicles(vData);
      setDrivers(dData);
      setTrips(tData);
      setIsUsingMockData(false);
    } catch (err: any) {
      console.error("API connection failed, falling back to mock data:", err.message);
      setError(err.message);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  }, []);

  const addVehicle = useCallback(async (v: Vehicle) => {
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error("Failed to add vehicle to server");
      }
    } catch (err) {
      console.error("Failed to add vehicle to server, adding locally:", err);
    } finally {
      setVehicles(prev => [...prev, v]);
    }
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, retired: true, status: 'Offline' as const } : v));
  }, []);

  const updateDriver = useCallback((id: string, data: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, []);

  const addTrip = useCallback(async (t: Trip) => {
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/trips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t),
        });
        if (!res.ok) throw new Error("Failed to add trip to server");
      }
    } catch (err) {
      console.error("Failed to add trip to server, adding locally:", err);
    } finally {
      setTrips(prev => [...prev, t]);
    }
  }, []);

  const updateTrip = useCallback((id: string, data: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const addMaintenance = useCallback((m: MaintenanceRecord) => {
    setMaintenance(prev => [...prev, m]);
  }, []);

  const updateMaintenance = useCallback((id: string, data: Partial<MaintenanceRecord>) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    setAuditLogs(prev => [{ ...log, id: `a${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]);
  }, []);

  const addTicket = useCallback((t: Omit<SupportTicket, 'id' | 'createdAt'>) => {
    setTickets(prev => [...prev, { ...t, id: `TK-${1000 + prev.length}`, createdAt: new Date().toISOString() }]);
  }, []);

  const updateTicket = useCallback((id: string, data: Partial<SupportTicket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  return (
    <FleetContext.Provider value={{
      vehicles, drivers, trips, maintenance, auditLogs, tickets,
      updateVehicle, addVehicle, deleteVehicle, updateDriver,
      addTrip, updateTrip, addMaintenance, updateMaintenance,
      addAuditLog, addTicket, updateTicket,
      loading, error, isUsingMockData
    }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
}
