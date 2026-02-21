import { useState, useMemo } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDriverStatusColor, isLicenseExpired, isLicenseExpiringSoon } from '@/data/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { User, Shield, AlertTriangle, X, Award } from 'lucide-react';

const CHART_STYLE = { background: 'hsl(220 20% 12%)', border: '1px solid hsl(220 15% 22%)', borderRadius: '12px', color: 'hsl(210 40% 95%)' };

export default function DriverProfiles() {
  const { drivers, updateDriver, addAuditLog } = useFleet();
  const { user, hasPermission } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedDriver = drivers.find(d => d.id === selected);

  const safetyColor = (s: number) => s >= 85 ? 'hsl(152 70% 45%)' : s >= 70 ? 'hsl(38 92% 55%)' : 'hsl(0 72% 55%)';

  const toggleStatus = (dId: string, newStatus: 'On Duty' | 'Off Duty' | 'Suspended') => {
    const d = drivers.find(dr => dr.id === dId);
    if (!d) return;
    updateDriver(dId, { status: newStatus });
    addAuditLog({ userId: user!.id, userName: user!.name, action: `Changed driver status`, target: d.name, previousValue: d.status, newValue: newStatus });
  };

  const mockPerformance = [
    { month: 'Sep', score: 82 }, { month: 'Oct', score: 85 }, { month: 'Nov', score: 78 },
    { month: 'Dec', score: 90 }, { month: 'Jan', score: 88 }, { month: 'Feb', score: selectedDriver?.safetyScore || 85 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Driver Performance & Safety</h1>

      {/* Driver cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drivers.map((d, i) => {
          const expired = isLicenseExpired(d.licenseExpiry);
          const expiring = isLicenseExpiringSoon(d.licenseExpiry);
          const completionRate = d.totalTrips > 0 ? Math.round((d.completedTrips / d.totalTrips) * 100) : 0;
          return (
            <div key={d.id} className="glass-card-hover p-5 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setSelected(d.id)}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: `${safetyColor(d.safetyScore)}20`, color: safetyColor(d.safetyScore) }}>
                  {d.safetyScore}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: 'hsl(210 40% 95%)' }}>{d.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={getDriverStatusColor(d.status)}>{d.status}</span>
                    {expired && <span className="chip-danger text-[10px]">License Expired</span>}
                    {expiring && !expired && <span className="chip-warning text-[10px]">Expiring Soon</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [d.totalTrips.toString(), 'Trips'],
                  [`${completionRate}%`, 'Completed'],
                  [d.incidents.toString(), 'Incidents'],
                ].map(([val, label]) => (
                  <div key={label} className="p-2 rounded-lg" style={{ background: 'hsl(220 20% 10%)' }}>
                    <p className="font-mono font-bold text-sm" style={{ color: 'hsl(210 40% 90%)' }}>{val}</p>
                    <p className="text-[10px]" style={{ color: 'hsl(215 15% 55%)' }}>{label}</p>
                  </div>
                ))}
              </div>
              {d.certifications.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {d.certifications.map(c => (
                    <span key={c} className="chip-info text-[10px]">{c}</span>
                  ))}
                </div>
              )}
              {/* Status toggle */}
              {hasPermission('editDriverCompliance') && (
                <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'hsl(220 15% 18%)' }} onClick={e => e.stopPropagation()}>
                  {(['On Duty', 'Off Duty', 'Suspended'] as const).filter(s => s !== d.status).map(s => (
                    <button key={s} onClick={() => toggleStatus(d.id, s)} className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: s === 'Suspended' ? 'hsl(0 72% 55% / 0.1)' : 'hsl(220 20% 14%)', color: s === 'Suspended' ? 'hsl(0 72% 55%)' : 'hsl(210 40% 80%)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ background: `${safetyColor(selectedDriver.safetyScore)}20`, color: safetyColor(selectedDriver.safetyScore) }}>
                  {selectedDriver.safetyScore}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'hsl(210 40% 95%)' }}>{selectedDriver.name}</h2>
                  <p className="text-xs" style={{ color: 'hsl(215 15% 55%)' }}>{selectedDriver.email} • {selectedDriver.region}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: 'hsl(215 15% 55%)' }}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ['License Expiry', selectedDriver.licenseExpiry],
                ['Status', selectedDriver.status],
                ['Hire Date', selectedDriver.hireDate],
                ['Region', selectedDriver.region],
              ].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl" style={{ background: 'hsl(220 20% 10%)' }}>
                  <p className="text-xs mb-1" style={{ color: 'hsl(215 15% 55%)' }}>{l}</p>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>{v}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 mb-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'hsl(215 15% 55%)' }}>SAFETY TREND</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Line type="monotone" dataKey="score" stroke="hsl(190 90% 50%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(190 90% 50%)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
