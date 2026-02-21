import { useState, useMemo } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trip, TripStatus, getTripStatusColor, CARGO_TYPES, isLicenseExpired } from '@/data/mockData';
import { Plus, X, MapPin, Truck, Clock, AlertTriangle } from 'lucide-react';

export default function TripDispatcher() {
  const { trips, vehicles, drivers, addTrip, updateTrip, addAuditLog, loading, isUsingMockData } = useFleet();
  const { user, hasPermission } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TripStatus | ''>('');
  const [showAdd, setShowAdd] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState({ pickup: '', drop: '', cargoType: 'General Freight', cargoWeight: 5000, vehicleId: '', driverId: '', eta: '' });

  // All hooks must be called before any early returns
  const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Idle' && !v.retired), [vehicles]);
  const compliantDrivers = useMemo(() => drivers.filter(d => d.status === 'On Duty' && !isLicenseExpired(d.licenseExpiry) && d.safetyScore >= 70), [drivers]);
  const filtered = useMemo(() => trips.filter(t => !statusFilter || t.status === statusFilter), [trips, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Trip Dispatcher...</p>
      </div>
    );
  }

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.pickup) errs.push('Pickup location required');
    if (!form.drop) errs.push('Drop location required');
    if (!form.vehicleId) errs.push('Select a vehicle');
    if (!form.driverId) errs.push('Select a driver');
    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    const driver = drivers.find(d => d.id === form.driverId);
    if (vehicle && form.cargoWeight > vehicle.capacity) errs.push(`Cargo exceeds vehicle capacity (${vehicle.capacity.toLocaleString()} kg)`);
    if (vehicle && vehicle.status !== 'Idle') errs.push('Vehicle is not available');
    if (driver && isLicenseExpired(driver.licenseExpiry)) errs.push('Driver license expired');
    if (driver && driver.safetyScore < 70) errs.push('Driver safety score too low (<70)');
    if (driver && driver.status !== 'On Duty') errs.push('Driver not on duty');
    return errs;
  };

  const handleAdd = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    const nt: Trip = {
      id: `t${Date.now()}`, pickup: form.pickup, drop: form.drop, cargoType: form.cargoType,
      cargoWeight: form.cargoWeight, vehicleId: form.vehicleId, driverId: form.driverId,
      status: 'Draft', eta: form.eta, distance: Math.floor(Math.random() * 500 + 100),
      startDate: new Date().toISOString(), progress: 0,
    };
    addTrip(nt);
    addAuditLog({ userId: user!.id, userName: user!.name, action: 'Created trip', target: `Trip ${nt.id}` });
    setShowAdd(false);
    setForm({ pickup: '', drop: '', cargoType: 'General Freight', cargoWeight: 5000, vehicleId: '', driverId: '', eta: '' });
    setErrors([]);
  };

  const handleStatusChange = (trip: Trip, newStatus: TripStatus) => {
    updateTrip(trip.id, { status: newStatus, ...(newStatus === 'Completed' ? { progress: 100, endDate: new Date().toISOString() } : {}) });
    addAuditLog({ userId: user!.id, userName: user!.name, action: `Changed trip status`, target: `Trip ${trip.id}`, previousValue: trip.status, newValue: newStatus });
  };

  const getNextStatuses = (current: TripStatus): TripStatus[] => {
    switch (current) {
      case 'Draft': return ['Dispatched', 'Cancelled'];
      case 'Dispatched': return ['In Transit', 'Cancelled'];
      case 'In Transit': return ['Completed', 'Cancelled'];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Trip Dispatcher</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'hsl(215 15% 55%)' }}>{filtered.length} trips</p>
            {isUsingMockData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                Mock Data Mode
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="input-dark w-auto">
            <option value="">All Status</option>
            {(['Draft', 'Dispatched', 'In Transit', 'Completed', 'Cancelled'] as TripStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
          {(hasPermission('createTrip')) && (
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Trip
            </button>
          )}
        </div>
      </div>

      {/* Trip cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t, i) => {
          const v = vehicles.find(ve => ve.id === t.vehicleId);
          const d = drivers.find(dr => dr.id === t.driverId);
          return (
            <div key={t.id} className="glass-card-hover p-5 animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelectedTrip(t)}>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-xs font-semibold" style={{ color: 'hsl(190 90% 50%)' }}>{t.id.toUpperCase()}</span>
                <span className={getTripStatusColor(t.status)}>{t.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} style={{ color: 'hsl(152 70% 45%)' }} />
                <span className="text-sm" style={{ color: 'hsl(210 40% 85%)' }}>{t.pickup}</span>
                <span style={{ color: 'hsl(215 15% 45%)' }}>→</span>
                <MapPin size={14} style={{ color: 'hsl(0 72% 55%)' }} />
                <span className="text-sm" style={{ color: 'hsl(210 40% 85%)' }}>{t.drop}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4" style={{ color: 'hsl(215 15% 55%)' }}>
                <div className="flex items-center gap-1"><Truck size={12} /> {v?.plate || 'Unassigned'}</div>
                <div>{d?.name || 'Unassigned'}</div>
                <div>{t.cargoType} • {t.cargoWeight.toLocaleString()} kg</div>
                <div className="flex items-center gap-1"><Clock size={12} /> {t.distance} mi</div>
              </div>
              {t.status === 'In Transit' && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'hsl(215 15% 55%)' }}>Progress</span>
                    <span className="font-mono" style={{ color: 'hsl(190 90% 50%)' }}>{t.progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${t.progress}%` }} /></div>
                </div>
              )}
              {getNextStatuses(t.status).length > 0 && (
                <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'hsl(220 15% 18%)' }} onClick={e => e.stopPropagation()}>
                  {getNextStatuses(t.status).map(ns => (
                    <button key={ns} onClick={() => handleStatusChange(t, ns)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${ns === 'Cancelled' ? '' : 'btn-primary text-xs'}`}
                      style={ns === 'Cancelled' ? { background: 'hsl(0 72% 55% / 0.1)', color: 'hsl(0 72% 55%)' } : {}}>
                      {ns}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Trip Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setErrors([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(210 40% 95%)' }}>Create Trip</h2>
              <button onClick={() => { setShowAdd(false); setErrors([]); }} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>
            {errors.length > 0 && (
              <div className="mb-4 p-3 rounded-xl space-y-1" style={{ background: 'hsl(0 72% 55% / 0.1)', border: '1px solid hsl(0 72% 55% / 0.2)' }}>
                {errors.map((e, i) => <p key={i} className="text-sm flex items-center gap-2" style={{ color: 'hsl(0 72% 55%)' }}><AlertTriangle size={14} />{e}</p>)}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Pickup</label><input value={form.pickup} onChange={e => setForm(p => ({ ...p, pickup: e.target.value }))} className="input-dark" placeholder="City, State" /></div>
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Drop</label><input value={form.drop} onChange={e => setForm(p => ({ ...p, drop: e.target.value }))} className="input-dark" placeholder="City, State" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Cargo Type</label><select value={form.cargoType} onChange={e => setForm(p => ({ ...p, cargoType: e.target.value }))} className="input-dark">{CARGO_TYPES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Weight (kg)</label><input type="number" value={form.cargoWeight} onChange={e => setForm(p => ({ ...p, cargoWeight: +e.target.value }))} className="input-dark" /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Vehicle (Available Only)</label>
                <select value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))} className="input-dark">
                  <option value="">Select Vehicle</option>
                  {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.type} ({v.capacity.toLocaleString()} kg)</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Driver (Compliant Only)</label>
                <select value={form.driverId} onChange={e => setForm(p => ({ ...p, driverId: e.target.value }))} className="input-dark">
                  <option value="">Select Driver</option>
                  {compliantDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — Score: {d.safetyScore}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>ETA</label><input type="datetime-local" value={form.eta} onChange={e => setForm(p => ({ ...p, eta: e.target.value }))} className="input-dark" /></div>
              <button onClick={handleAdd} className="btn-primary w-full">Create Trip</button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-mono" style={{ color: 'hsl(210 40% 95%)' }}>{selectedTrip.id.toUpperCase()}</h2>
              <button onClick={() => setSelectedTrip(null)} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>
            {/* Simulated route map */}
            <div className="relative h-40 rounded-xl mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(220 20% 10%), hsl(220 25% 14%))' }}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'hsl(215 15% 35%)' }}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <MapPin size={20} style={{ color: 'hsl(152 70% 45%)' }} />
                    <p className="text-xs mt-1" style={{ color: 'hsl(210 40% 80%)' }}>{selectedTrip.pickup}</p>
                  </div>
                  <div className="flex-1 relative" style={{ width: '150px' }}>
                    <div className="h-0.5 w-full" style={{ background: 'hsl(190 90% 50% / 0.3)' }} />
                    <div className="h-0.5 absolute top-0 left-0 transition-all" style={{ width: `${selectedTrip.progress}%`, background: 'hsl(190 90% 50%)' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 transition-all" style={{ left: `${selectedTrip.progress}%` }}>
                      <Truck size={16} style={{ color: 'hsl(190 90% 50%)' }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <MapPin size={20} style={{ color: 'hsl(0 72% 55%)' }} />
                    <p className="text-xs mt-1" style={{ color: 'hsl(210 40% 80%)' }}>{selectedTrip.drop}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Status', selectedTrip.status], ['Distance', `${selectedTrip.distance} mi`],
                ['Cargo', `${selectedTrip.cargoType} (${selectedTrip.cargoWeight.toLocaleString()} kg)`],
                ['Progress', `${selectedTrip.progress}%`],
                ['Vehicle', vehicles.find(v => v.id === selectedTrip.vehicleId)?.plate || 'N/A'],
                ['Driver', drivers.find(d => d.id === selectedTrip.driverId)?.name || 'N/A'],
              ].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl" style={{ background: 'hsl(220 20% 10%)' }}>
                  <p className="text-xs mb-1" style={{ color: 'hsl(215 15% 55%)' }}>{l}</p>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
