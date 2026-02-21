import { useState, useMemo } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle, VehicleType, VehicleStatus, getVehicleStatusColor, REGIONS } from '@/data/mockData';
import { Plus, Search, Truck, X, ChevronDown, AlertTriangle, Shield } from 'lucide-react';

export default function VehicleRegistry() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, addAuditLog, loading, isUsingMockData } = useFleet();
  const { user, hasPermission, canEditVehicleInRegion } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => vehicles.filter(v => {
    if (search && !v.plate.toLowerCase().includes(search.toLowerCase()) && !v.make.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    if (regionFilter && v.region !== regionFilter) return false;
    if (typeFilter && v.type !== typeFilter) return false;
    return true;
  }), [search, statusFilter, regionFilter, typeFilter, vehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Vehicle Registry...</p>
      </div>
    );
  }

  const [form, setForm] = useState({ plate: '', type: 'Truck' as VehicleType, region: 'Northeast', capacity: 25000, make: '', model: '', year: 2025 });

  const handleAdd = () => {
    if (!form.plate || vehicles.some(v => v.plate === form.plate)) return;
    const nv: Vehicle = {
      id: `v${Date.now()}`, plate: form.plate, type: form.type, status: 'Idle', region: form.region,
      capacity: form.capacity, healthScore: 100, mileage: 0, fuelLevel: 100,
      insuranceExpiry: '2027-12-31', acquisitionCost: 80000, retired: false,
      lastService: new Date().toISOString().split('T')[0], nextService: '2026-06-01',
      year: form.year, make: form.make, model: form.model
    };
    addVehicle(nv);
    addAuditLog({ userId: user!.id, userName: user!.name, action: 'Added vehicle', target: nv.plate });
    setShowAdd(false);
    setForm({ plate: '', type: 'Truck', region: 'Northeast', capacity: 25000, make: '', model: '', year: 2025 });
  };

  const handleRetire = (v: Vehicle) => {
    if (v.status === 'On Trip' || v.status === 'En Route') return;
    deleteVehicle(v.id);
    addAuditLog({ userId: user!.id, userName: user!.name, action: 'Retired vehicle', target: v.plate, previousValue: v.status, newValue: 'Offline' });
  };

  const healthColor = (score: number) => score >= 80 ? 'hsl(152 70% 45%)' : score >= 60 ? 'hsl(38 92% 55%)' : 'hsl(0 72% 55%)';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Vehicle Registry</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'hsl(215 15% 55%)' }}>{filtered.length} vehicles</p>
            {isUsingMockData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                Mock Data Mode
              </span>
            )}
          </div>
        </div>
        {(hasPermission('editVehicle') || hasPermission('manageUsers')) && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 self-start">
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215 15% 55%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-9" placeholder="Search plates, makes..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="input-dark w-auto min-w-[140px]">
          <option value="">All Status</option>
          {(['On Trip', 'Idle', 'En Route', 'In Shop', 'Offline'] as VehicleStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="input-dark w-auto min-w-[140px]">
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-dark w-auto min-w-[120px]">
          <option value="">All Types</option>
          {(['Truck', 'Van', 'Trailer', 'Tanker'] as VehicleType[]).map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th><th>Type</th><th>Status</th><th>Region</th><th>Health</th><th>Fuel</th><th>Mileage</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={v.id} className="cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 30}ms` }} onClick={() => setSelectedVehicle(v)}>
                <td>
                  <div className="flex items-center gap-2">
                    <Truck size={16} style={{ color: 'hsl(190 90% 50%)' }} />
                    <span className="font-mono font-semibold" style={{ color: 'hsl(210 40% 95%)' }}>{v.plate}</span>
                    {v.retired && <span className="chip-danger text-[10px]">Retired</span>}
                  </div>
                </td>
                <td><span className="chip-neutral">{v.type}</span></td>
                <td><span className={getVehicleStatusColor(v.status)}>{v.status}</span></td>
                <td style={{ color: 'hsl(210 40% 80%)' }}>{v.region}</td>
                <td>
                  <div className="health-score" style={{ background: `${healthColor(v.healthScore)}20`, color: healthColor(v.healthScore) }}>
                    {v.healthScore}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full" style={{ background: 'hsl(220 15% 20%)' }}>
                      <div className="h-full rounded-full" style={{ width: `${v.fuelLevel}%`, background: v.fuelLevel > 30 ? 'hsl(152 70% 45%)' : 'hsl(0 72% 55%)' }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'hsl(215 15% 55%)' }}>{v.fuelLevel}%</span>
                  </div>
                </td>
                <td className="font-mono text-xs" style={{ color: 'hsl(210 40% 80%)' }}>{v.mileage.toLocaleString()} mi</td>
                <td onClick={e => e.stopPropagation()}>
                  {canEditVehicleInRegion(v.region) && !v.retired && v.status !== 'On Trip' && v.status !== 'En Route' && (
                    <button onClick={() => handleRetire(v)} className="text-xs px-3 py-1 rounded-lg transition-colors" style={{ color: 'hsl(0 72% 55%)', background: 'hsl(0 72% 55% / 0.1)' }}>Retire</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(210 40% 95%)' }}>Add Vehicle</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>License Plate</label><input value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))} className="input-dark" placeholder="TRK-0000" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as VehicleType }))} className="input-dark">{(['Truck', 'Van', 'Trailer', 'Tanker'] as VehicleType[]).map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Region</label><select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="input-dark">{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Make</label><input value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))} className="input-dark" placeholder="Freightliner" /></div>
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Model</label><input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} className="input-dark" placeholder="Cascadia" /></div>
                <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Year</label><input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))} className="input-dark" /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Capacity (kg)</label><input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: +e.target.value }))} className="input-dark" /></div>
              <button onClick={handleAdd} className="btn-primary w-full">Add Vehicle</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Truck size={24} style={{ color: 'hsl(190 90% 50%)' }} />
                <div>
                  <h2 className="text-lg font-bold font-mono" style={{ color: 'hsl(210 40% 95%)' }}>{selectedVehicle.plate}</h2>
                  <p className="text-xs" style={{ color: 'hsl(215 15% 55%)' }}>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVehicle(null)} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                ['Status', selectedVehicle.status],
                ['Type', selectedVehicle.type],
                ['Region', selectedVehicle.region],
                ['Health', `${selectedVehicle.healthScore}/100`],
                ['Fuel', `${selectedVehicle.fuelLevel}%`],
                ['Mileage', `${selectedVehicle.mileage.toLocaleString()} mi`],
                ['Capacity', `${selectedVehicle.capacity.toLocaleString()} kg`],
                ['Insurance Expiry', selectedVehicle.insuranceExpiry],
                ['Last Service', selectedVehicle.lastService],
                ['Next Service', selectedVehicle.nextService],
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'hsl(220 20% 10%)' }}>
                  <p className="text-xs mb-1" style={{ color: 'hsl(215 15% 55%)' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>{val}</p>
                </div>
              ))}
            </div>
            {/* Health bar */}
            <div className="p-4 rounded-xl" style={{ background: 'hsl(220 20% 10%)' }}>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'hsl(215 15% 55%)' }}>Vehicle Health</span>
                <span style={{ color: healthColor(selectedVehicle.healthScore) }}>{selectedVehicle.healthScore}%</span>
              </div>
              <div className="progress-bar">
                <div className="h-full rounded-full transition-all" style={{ width: `${selectedVehicle.healthScore}%`, background: healthColor(selectedVehicle.healthScore) }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
