import { useState, useMemo } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { MaintenanceRecord, MaintenanceStatus, SERVICE_TYPES } from '@/data/mockData';
import { useCountUp } from '@/hooks/useCountUp';
import { Plus, X, Wrench, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Maintenance() {
  const { maintenance, vehicles, addMaintenance, updateMaintenance, updateVehicle, addAuditLog, loading } = useFleet();
  const { user, hasPermission } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const [form, setForm] = useState({ vehicleId: '', serviceType: SERVICE_TYPES[0], cost: 500, expectedCompletion: '', description: '' });

  const totalCost = maintenance.reduce((s, m) => s + m.cost, 0);
  const activeMaint = maintenance.filter(m => m.status !== 'Completed').length;
  const avgDays = 5.2;
  const animatedCost = useCountUp(totalCost);

  const costByType = useMemo(() => SERVICE_TYPES.map(st => ({
    name: st.length > 12 ? st.slice(0, 12) + '…' : st,
    cost: maintenance.filter(m => m.serviceType === st).reduce((s, m) => s + m.cost, 0),
  })).filter(d => d.cost > 0), [maintenance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Maintenance...</p>
      </div>
    );
  }

  const handleAdd = () => {
    if (!form.vehicleId) return;
    const m: MaintenanceRecord = {
      id: `m${Date.now()}`, vehicleId: form.vehicleId, serviceType: form.serviceType,
      cost: form.cost, serviceDate: new Date().toISOString().split('T')[0],
      expectedCompletion: form.expectedCompletion, status: 'In Progress',
      description: form.description, technician: 'Auto-assigned',
    };
    addMaintenance(m);
    updateVehicle(form.vehicleId, { status: 'In Shop' });
    addAuditLog({ userId: user!.id, userName: user!.name, action: 'Added maintenance', target: vehicles.find(v => v.id === form.vehicleId)?.plate || '' });
    setShowAdd(false);
    setForm({ vehicleId: '', serviceType: SERVICE_TYPES[0], cost: 500, expectedCompletion: '', description: '' });
  };

  const handleComplete = (id: string) => {
    const m = maintenance.find(r => r.id === id);
    if (!m) return;
    updateMaintenance(id, { status: 'Completed' });
    updateVehicle(m.vehicleId, { status: 'Idle' });
    addAuditLog({ userId: user!.id, userName: user!.name, action: 'Completed maintenance', target: vehicles.find(v => v.id === m.vehicleId)?.plate || '', previousValue: 'In Shop', newValue: 'Idle' });
    setConfirmComplete(null);
  };

  const statusIcon = (s: MaintenanceStatus) => {
    if (s === 'Completed') return <CheckCircle size={14} style={{ color: 'hsl(152 70% 45%)' }} />;
    if (s === 'In Progress') return <Wrench size={14} style={{ color: 'hsl(38 92% 55%)' }} />;
    return <Clock size={14} style={{ color: 'hsl(210 80% 55%)' }} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Maintenance & Service</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 self-start"><Plus size={16} /> Add Service</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <p className="text-xs mb-2" style={{ color: 'hsl(215 15% 55%)' }}>TOTAL MAINTENANCE COST</p>
          <p className="kpi-value" style={{ color: 'hsl(190 90% 50%)' }}>${animatedCost.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs mb-2" style={{ color: 'hsl(215 15% 55%)' }}>ACTIVE MAINTENANCE</p>
          <p className="kpi-value" style={{ color: 'hsl(38 92% 55%)' }}>{activeMaint}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs mb-2" style={{ color: 'hsl(215 15% 55%)' }}>AVG DAYS IN SHOP</p>
          <p className="kpi-value" style={{ color: 'hsl(210 80% 55%)' }}>{avgDays}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Cost by Service Type</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costByType}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(220 20% 12%)', border: '1px solid hsl(220 15% 22%)', borderRadius: '12px', color: 'hsl(210 40% 95%)' }} />
              <Bar dataKey="cost" fill="hsl(190 90% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Service</th><th>Cost</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {maintenance.map(m => {
              const v = vehicles.find(ve => ve.id === m.vehicleId);
              return (
                <tr key={m.id}>
                  <td className="font-mono font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>{v?.plate || 'N/A'}</td>
                  <td style={{ color: 'hsl(210 40% 80%)' }}>{m.serviceType}</td>
                  <td className="font-mono" style={{ color: 'hsl(190 90% 50%)' }}>${m.cost.toLocaleString()}</td>
                  <td style={{ color: 'hsl(215 15% 55%)' }}>{m.serviceDate}</td>
                  <td><div className="flex items-center gap-1.5">{statusIcon(m.status)}<span className="text-sm" style={{ color: 'hsl(210 40% 85%)' }}>{m.status}</span></div></td>
                  <td>
                    {m.status !== 'Completed' && (
                      <button onClick={() => setConfirmComplete(m.id)} className="text-xs px-3 py-1 rounded-lg" style={{ background: 'hsl(152 70% 45% / 0.1)', color: 'hsl(152 70% 45%)' }}>Complete</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(210 40% 95%)' }}>Add Maintenance</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Vehicle</label>
                <select value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))} className="input-dark">
                  <option value="">Select</option>
                  {vehicles.filter(v => !v.retired).map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Service Type</label>
                <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))} className="input-dark">{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Cost ($)</label><input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: +e.target.value }))} className="input-dark" /></div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Expected Completion</label><input type="date" value={form.expectedCompletion} onChange={e => setForm(p => ({ ...p, expectedCompletion: e.target.value }))} className="input-dark" /></div>
              <div><label className="block text-xs font-medium mb-1 uppercase" style={{ color: 'hsl(215 15% 55%)' }}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-dark min-h-[80px]" /></div>
              <button onClick={handleAdd} className="btn-primary w-full">Add Maintenance Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Complete Dialog */}
      {confirmComplete && (
        <div className="modal-overlay" onClick={() => setConfirmComplete(null)}>
          <div className="modal-content max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'hsl(152 70% 45%)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(210 40% 95%)' }}>Complete Maintenance?</h3>
            <p className="text-sm mb-6" style={{ color: 'hsl(215 15% 55%)' }}>This will mark the service as complete and set the vehicle back to Idle.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmComplete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleComplete(confirmComplete)} className="btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
