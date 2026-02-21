// ===== TYPES =====
export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst' | 'Admin';
export type VehicleStatus = 'On Trip' | 'Idle' | 'En Route' | 'In Shop' | 'Offline';
export type VehicleType = 'Truck' | 'Van' | 'Trailer' | 'Tanker';
export type TripStatus = 'Draft' | 'Dispatched' | 'In Transit' | 'Completed' | 'Cancelled';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'Suspended';
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  region: string;
  avatar: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  status: VehicleStatus;
  region: string;
  capacity: number;
  healthScore: number;
  mileage: number;
  fuelLevel: number;
  insuranceExpiry: string;
  acquisitionCost: number;
  retired: boolean;
  lastService: string;
  nextService: string;
  year: number;
  make: string;
  model: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseExpiry: string;
  safetyScore: number;
  status: DriverStatus;
  region: string;
  totalTrips: number;
  completedTrips: number;
  incidents: number;
  hireDate: string;
  certifications: string[];
}

export interface Trip {
  id: string;
  pickup: string;
  drop: string;
  cargoType: string;
  cargoWeight: number;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  eta: string;
  distance: number;
  startDate: string;
  endDate?: string;
  fuelUsed?: number;
  fuelCost?: number;
  notes?: string;
  progress: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  serviceDate: string;
  expectedCompletion: string;
  status: MaintenanceStatus;
  description: string;
  technician: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'departure' | 'arrival' | 'maintenance' | 'alert' | 'cargo' | 'fuel';
  message: string;
  timestamp: string;
  icon: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  message: string;
  assignedTo: string;
  assignedRole: UserRole;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  category: string;
}

// ===== PERMISSIONS =====
export const PERMISSIONS: Record<UserRole, Record<string, boolean | string>> = {
  'Fleet Manager': {
    viewVehicles: true, editVehicle: true, createTrip: false, assignDriver: false,
    validateCargo: false, editDriverCompliance: false, viewFinancialReports: true,
    editFinancialData: false, manageUsers: false, regionRestricted: true,
  },
  'Dispatcher': {
    viewVehicles: true, editVehicle: false, createTrip: true, assignDriver: true,
    validateCargo: true, editDriverCompliance: false, viewFinancialReports: false,
    editFinancialData: false, manageUsers: false, regionRestricted: true,
  },
  'Safety Officer': {
    viewVehicles: true, editVehicle: false, createTrip: false, assignDriver: false,
    validateCargo: false, editDriverCompliance: true, viewFinancialReports: false,
    editFinancialData: false, manageUsers: false, regionRestricted: false,
  },
  'Financial Analyst': {
    viewVehicles: true, editVehicle: false, createTrip: false, assignDriver: false,
    validateCargo: false, editDriverCompliance: false, viewFinancialReports: true,
    editFinancialData: false, manageUsers: false, regionRestricted: false,
  },
  'Admin': {
    viewVehicles: true, editVehicle: true, createTrip: true, assignDriver: true,
    validateCargo: true, editDriverCompliance: true, viewFinancialReports: true,
    editFinancialData: true, manageUsers: true, regionRestricted: false,
  },
};

export const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest'];

// ===== MOCK DATA =====
export const USERS: User[] = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex@fleet.io', password: 'password', role: 'Fleet Manager', region: 'Northeast', avatar: 'AM' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@fleet.io', password: 'password', role: 'Dispatcher', region: 'Southeast', avatar: 'JL' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@fleet.io', password: 'password', role: 'Safety Officer', region: 'Midwest', avatar: 'SR' },
  { id: 'u4', name: 'Taylor Chen', email: 'taylor@fleet.io', password: 'password', role: 'Financial Analyst', region: 'West', avatar: 'TC' },
  { id: 'u5', name: 'Casey Wright', email: 'admin@fleet.io', password: 'password', role: 'Admin', region: 'Northeast', avatar: 'CW' },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'TRK-1021', type: 'Truck', status: 'On Trip', region: 'Northeast', capacity: 25000, healthScore: 87, mileage: 125400, fuelLevel: 65, insuranceExpiry: '2026-08-15', acquisitionCost: 85000, retired: false, lastService: '2026-01-10', nextService: '2026-04-10', year: 2023, make: 'Freightliner', model: 'Cascadia' },
  { id: 'v2', plate: 'TRK-1045', type: 'Truck', status: 'Idle', region: 'Southeast', capacity: 30000, healthScore: 92, mileage: 89200, fuelLevel: 80, insuranceExpiry: '2026-11-20', acquisitionCost: 92000, retired: false, lastService: '2026-01-25', nextService: '2026-04-25', year: 2024, make: 'Kenworth', model: 'T680' },
  { id: 'v3', plate: 'VAN-3012', type: 'Van', status: 'En Route', region: 'Midwest', capacity: 5000, healthScore: 74, mileage: 201000, fuelLevel: 42, insuranceExpiry: '2026-06-01', acquisitionCost: 35000, retired: false, lastService: '2025-12-15', nextService: '2026-03-15', year: 2022, make: 'Ford', model: 'Transit' },
  { id: 'v4', plate: 'TRL-7890', type: 'Trailer', status: 'In Shop', region: 'West', capacity: 40000, healthScore: 55, mileage: 310000, fuelLevel: 0, insuranceExpiry: '2026-03-10', acquisitionCost: 45000, retired: false, lastService: '2026-02-01', nextService: '2026-05-01', year: 2021, make: 'Great Dane', model: 'Everest' },
  { id: 'v5', plate: 'TNK-5501', type: 'Tanker', status: 'Idle', region: 'Southwest', capacity: 35000, healthScore: 81, mileage: 178000, fuelLevel: 90, insuranceExpiry: '2026-09-30', acquisitionCost: 110000, retired: false, lastService: '2026-01-18', nextService: '2026-04-18', year: 2023, make: 'Peterbilt', model: '579' },
  { id: 'v6', plate: 'TRK-2200', type: 'Truck', status: 'On Trip', region: 'Northeast', capacity: 28000, healthScore: 69, mileage: 245000, fuelLevel: 35, insuranceExpiry: '2026-07-22', acquisitionCost: 78000, retired: false, lastService: '2025-11-20', nextService: '2026-02-20', year: 2022, make: 'Volvo', model: 'VNL' },
  { id: 'v7', plate: 'VAN-3055', type: 'Van', status: 'Offline', region: 'Southeast', capacity: 4500, healthScore: 43, mileage: 350000, fuelLevel: 10, insuranceExpiry: '2025-12-01', acquisitionCost: 32000, retired: true, lastService: '2025-10-05', nextService: '2026-01-05', year: 2020, make: 'Mercedes', model: 'Sprinter' },
  { id: 'v8', plate: 'TRK-3301', type: 'Truck', status: 'Idle', region: 'Midwest', capacity: 26000, healthScore: 95, mileage: 45000, fuelLevel: 72, insuranceExpiry: '2027-01-15', acquisitionCost: 98000, retired: false, lastService: '2026-02-05', nextService: '2026-05-05', year: 2025, make: 'Mack', model: 'Anthem' },
  { id: 'v9', plate: 'TNK-5520', type: 'Tanker', status: 'En Route', region: 'West', capacity: 32000, healthScore: 78, mileage: 167000, fuelLevel: 55, insuranceExpiry: '2026-10-10', acquisitionCost: 105000, retired: false, lastService: '2026-01-02', nextService: '2026-04-02', year: 2023, make: 'International', model: 'LT' },
  { id: 'v10', plate: 'TRK-4410', type: 'Truck', status: 'On Trip', region: 'Southwest', capacity: 27000, healthScore: 83, mileage: 134000, fuelLevel: 48, insuranceExpiry: '2026-12-05', acquisitionCost: 88000, retired: false, lastService: '2026-01-30', nextService: '2026-04-30', year: 2024, make: 'Freightliner', model: 'Cascadia' },
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Mike Johnson', email: 'mike@fleet.io', phone: '555-0101', licenseExpiry: '2027-03-15', safetyScore: 92, status: 'On Duty', region: 'Northeast', totalTrips: 342, completedTrips: 338, incidents: 2, hireDate: '2020-06-15', certifications: ['HAZMAT', 'Tanker'] },
  { id: 'd2', name: 'Sarah Williams', email: 'sarah@fleet.io', phone: '555-0102', licenseExpiry: '2026-08-20', safetyScore: 88, status: 'On Duty', region: 'Southeast', totalTrips: 256, completedTrips: 250, incidents: 4, hireDate: '2021-03-01', certifications: ['Doubles/Triples'] },
  { id: 'd3', name: 'Carlos Garcia', email: 'carlos@fleet.io', phone: '555-0103', licenseExpiry: '2026-04-01', safetyScore: 65, status: 'On Duty', region: 'Midwest', totalTrips: 189, completedTrips: 178, incidents: 8, hireDate: '2022-01-10', certifications: ['HAZMAT'] },
  { id: 'd4', name: 'Lisa Park', email: 'lisa@fleet.io', phone: '555-0104', licenseExpiry: '2025-12-30', safetyScore: 95, status: 'Suspended', region: 'West', totalTrips: 410, completedTrips: 408, incidents: 1, hireDate: '2019-09-20', certifications: ['HAZMAT', 'Tanker', 'Doubles/Triples'] },
  { id: 'd5', name: 'James Brown', email: 'james@fleet.io', phone: '555-0105', licenseExpiry: '2027-06-10', safetyScore: 78, status: 'On Duty', region: 'Southwest', totalTrips: 145, completedTrips: 140, incidents: 3, hireDate: '2023-02-28', certifications: ['Tanker'] },
  { id: 'd6', name: 'Elena Kowalski', email: 'elena@fleet.io', phone: '555-0106', licenseExpiry: '2027-01-15', safetyScore: 97, status: 'Off Duty', region: 'Northeast', totalTrips: 520, completedTrips: 518, incidents: 0, hireDate: '2018-04-12', certifications: ['HAZMAT', 'Tanker', 'Doubles/Triples', 'Passenger'] },
  { id: 'd7', name: 'Derek Thompson', email: 'derek@fleet.io', phone: '555-0107', licenseExpiry: '2026-09-30', safetyScore: 72, status: 'On Duty', region: 'Midwest', totalTrips: 98, completedTrips: 93, incidents: 5, hireDate: '2024-01-05', certifications: [] },
];

export const INITIAL_TRIPS: Trip[] = [
  { id: 't1', pickup: 'New York, NY', drop: 'Boston, MA', cargoType: 'Electronics', cargoWeight: 12000, vehicleId: 'v1', driverId: 'd1', status: 'In Transit', eta: '2026-02-21T18:00', distance: 215, startDate: '2026-02-21T06:00', progress: 65, fuelUsed: 45, fuelCost: 180 },
  { id: 't2', pickup: 'Atlanta, GA', drop: 'Miami, FL', cargoType: 'Perishables', cargoWeight: 8000, vehicleId: 'v2', driverId: 'd2', status: 'Draft', eta: '2026-02-23T14:00', distance: 660, startDate: '2026-02-22T08:00', progress: 0 },
  { id: 't3', pickup: 'Chicago, IL', drop: 'Detroit, MI', cargoType: 'Auto Parts', cargoWeight: 4500, vehicleId: 'v3', driverId: 'd3', status: 'In Transit', eta: '2026-02-21T20:00', distance: 282, startDate: '2026-02-21T10:00', progress: 40, fuelUsed: 28, fuelCost: 112 },
  { id: 't4', pickup: 'Los Angeles, CA', drop: 'Phoenix, AZ', cargoType: 'Fuel', cargoWeight: 30000, vehicleId: 'v9', driverId: 'd5', status: 'In Transit', eta: '2026-02-22T06:00', distance: 373, startDate: '2026-02-21T14:00', progress: 25, fuelUsed: 20, fuelCost: 80 },
  { id: 't5', pickup: 'Dallas, TX', drop: 'Houston, TX', cargoType: 'Construction', cargoWeight: 22000, vehicleId: 'v10', driverId: 'd7', status: 'Dispatched', eta: '2026-02-22T12:00', distance: 239, startDate: '2026-02-22T04:00', progress: 0 },
  { id: 't6', pickup: 'New York, NY', drop: 'Philadelphia, PA', cargoType: 'Medical Supplies', cargoWeight: 3000, vehicleId: 'v6', driverId: 'd6', status: 'Completed', eta: '2026-02-20T16:00', distance: 97, startDate: '2026-02-20T10:00', endDate: '2026-02-20T15:30', progress: 100, fuelUsed: 15, fuelCost: 60 },
  { id: 't7', pickup: 'Seattle, WA', drop: 'Portland, OR', cargoType: 'Timber', cargoWeight: 25000, vehicleId: 'v5', driverId: 'd1', status: 'Completed', eta: '2026-02-19T18:00', distance: 174, startDate: '2026-02-19T08:00', endDate: '2026-02-19T17:00', progress: 100, fuelUsed: 32, fuelCost: 128 },
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v4', serviceType: 'Engine Overhaul', cost: 4500, serviceDate: '2026-02-15', expectedCompletion: '2026-02-25', status: 'In Progress', description: 'Full engine rebuild due to high mileage', technician: 'Bob Martinez' },
  { id: 'm2', vehicleId: 'v6', serviceType: 'Brake Replacement', cost: 1200, serviceDate: '2026-02-10', expectedCompletion: '2026-02-12', status: 'Completed', description: 'Front and rear brake pad replacement', technician: 'Alice Yang' },
  { id: 'm3', vehicleId: 'v3', serviceType: 'Tire Rotation', cost: 300, serviceDate: '2026-03-01', expectedCompletion: '2026-03-01', status: 'Scheduled', description: 'Standard tire rotation and balance', technician: 'Bob Martinez' },
  { id: 'm4', vehicleId: 'v7', serviceType: 'Transmission Repair', cost: 6200, serviceDate: '2026-01-20', expectedCompletion: '2026-02-05', status: 'Completed', description: 'Transmission fluid leak and gear replacement', technician: 'Charlie Kim' },
  { id: 'm5', vehicleId: 'v1', serviceType: 'Oil Change', cost: 250, serviceDate: '2026-03-10', expectedCompletion: '2026-03-10', status: 'Scheduled', description: 'Routine oil and filter change', technician: 'Alice Yang' },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', userId: 'u1', userName: 'Alex Morgan', action: 'Updated vehicle status', target: 'TRK-1021', timestamp: '2026-02-21T08:15:00', previousValue: 'Idle', newValue: 'On Trip' },
  { id: 'a2', userId: 'u2', userName: 'Jordan Lee', action: 'Created trip', target: 'Trip #t1', timestamp: '2026-02-21T07:45:00' },
  { id: 'a3', userId: 'u3', userName: 'Sam Rivera', action: 'Suspended driver', target: 'Lisa Park', timestamp: '2026-02-20T16:30:00', previousValue: 'On Duty', newValue: 'Suspended' },
  { id: 'a4', userId: 'u5', userName: 'Casey Wright', action: 'Modified user role', target: 'Jordan Lee', timestamp: '2026-02-20T14:00:00', previousValue: 'Safety Officer', newValue: 'Dispatcher' },
  { id: 'a5', userId: 'u2', userName: 'Jordan Lee', action: 'Assigned driver', target: 'Trip #t3', timestamp: '2026-02-21T09:30:00' },
];

export function generateActivityEvents(): ActivityEvent[] {
  const events: ActivityEvent[] = [
    { id: 'e1', type: 'departure', message: 'TRK-1021 departed New York terminal', timestamp: '2 min ago', icon: '🚛' },
    { id: 'e2', type: 'cargo', message: 'Cargo validated for Trip #t2 (8,000 kg)', timestamp: '5 min ago', icon: '📦' },
    { id: 'e3', type: 'maintenance', message: 'TRL-7890 moved to maintenance bay', timestamp: '12 min ago', icon: '🛠' },
    { id: 'e4', type: 'alert', message: 'Driver Carlos Garcia license expiring soon', timestamp: '18 min ago', icon: '⚠️' },
    { id: 'e5', type: 'arrival', message: 'VAN-3012 arrived at Detroit checkpoint', timestamp: '25 min ago', icon: '📍' },
    { id: 'e6', type: 'fuel', message: 'TNK-5520 fuel level below 60%', timestamp: '32 min ago', icon: '⛽' },
    { id: 'e7', type: 'departure', message: 'TRK-4410 departed Dallas depot', timestamp: '45 min ago', icon: '🚛' },
    { id: 'e8', type: 'alert', message: 'VAN-3055 insurance expired', timestamp: '1 hr ago', icon: '🔴' },
    { id: 'e9', type: 'cargo', message: 'Hazmat clearance approved for TNK-5501', timestamp: '1.5 hr ago', icon: '✅' },
    { id: 'e10', type: 'maintenance', message: 'TRK-2200 brake inspection completed', timestamp: '2 hr ago', icon: '🔧' },
  ];
  return events;
}

export const CARGO_TYPES = ['Electronics', 'Perishables', 'Auto Parts', 'Fuel', 'Construction', 'Medical Supplies', 'Timber', 'Hazmat', 'General Freight'];
export const SERVICE_TYPES = ['Oil Change', 'Brake Replacement', 'Tire Rotation', 'Engine Overhaul', 'Transmission Repair', 'Electrical Repair', 'AC Service', 'Full Inspection'];

// Helpers
export function getVehicleStatusColor(status: VehicleStatus): string {
  switch (status) {
    case 'On Trip': return 'chip-success';
    case 'Idle': return 'chip-warning';
    case 'En Route': return 'chip-info';
    case 'In Shop': return 'chip-danger';
    case 'Offline': return 'chip-neutral';
  }
}

export function getVehicleStatusDot(status: VehicleStatus): string {
  switch (status) {
    case 'On Trip': return '🟢';
    case 'Idle': return '🟡';
    case 'En Route': return '🔵';
    case 'In Shop': return '🔴';
    case 'Offline': return '⚫';
  }
}

export function getTripStatusColor(status: TripStatus): string {
  switch (status) {
    case 'Draft': return 'chip-neutral';
    case 'Dispatched': return 'chip-info';
    case 'In Transit': return 'chip-primary';
    case 'Completed': return 'chip-success';
    case 'Cancelled': return 'chip-danger';
  }
}

export function getDriverStatusColor(status: DriverStatus): string {
  switch (status) {
    case 'On Duty': return 'chip-success';
    case 'Off Duty': return 'chip-warning';
    case 'Suspended': return 'chip-danger';
  }
}

export function isLicenseExpired(expiry: string): boolean {
  return new Date(expiry) < new Date();
}

export function isLicenseExpiringSoon(expiry: string): boolean {
  const d = new Date(expiry);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
}

export function isInsuranceExpired(expiry: string): boolean {
  return new Date(expiry) < new Date();
}
