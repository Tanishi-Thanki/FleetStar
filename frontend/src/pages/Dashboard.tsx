import { useMemo, useState, useEffect } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCountUp } from '@/hooks/useCountUp';
import { generateActivityEvents, getVehicleStatusDot, getVehicleStatusColor, REGIONS, VehicleStatus } from '@/data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Truck, AlertTriangle, Gauge, Package, Bell, Filter } from 'lucide-react';

function KPICard({ label, value, suffix, icon: Icon, color, delay = 0 }: { label: string; value: number; suffix?: string; icon: any; color: string; delay?: number }) {
  const animated = useCountUp(value);
  return (
    <div className="kpi-card opacity-0 animate-fade-in" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="kpi-value" style={{ color }}>{animated}{suffix || ''}</div>
      <p className="text-xs mt-2 font-medium" style={{ color: 'hsl(215 15% 55%)' }}>{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { vehicles, trips, maintenance, drivers, loading, error, isUsingMockData } = useFleet();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [events, setEvents] = useState(generateActivityEvents());

  // Simulate live events
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        '🚛 Vehicle departed terminal', '📦 Cargo scan completed', '⛽ Fuel top-up logged',
        '⚠️ Speed alert detected', '✅ Trip checkpoint reached', '🔧 Service reminder sent'
      ];
      setEvents(prev => [{
        id: `e${Date.now()}`,
        type: 'departure' as const,
        message: msgs[Math.floor(Math.random() * msgs.length)],
        timestamp: 'Just now',
        icon: ''
      }, ...prev.slice(0, 14)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Command Center...</p>
      </div>
    );
  }

  const filtered = selectedRegion ? vehicles.filter(v => v.region === selectedRegion) : vehicles;
  const activeFleet = filtered.filter(v => !v.retired).length;
  const maintenanceAlerts = maintenance.filter(m => m.status !== 'Completed').length;
  const utilization = Math.round((filtered.filter(v => v.status === 'On Trip' || v.status === 'En Route').length / Math.max(filtered.filter(v => !v.retired).length, 1)) * 100);
  const pendingCargo = trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;

  const statusGroups = useMemo(() => {
    const groups: Record<VehicleStatus, typeof filtered> = { 'On Trip': [], 'Idle': [], 'En Route': [], 'In Shop': [], 'Offline': [] };
    filtered.forEach(v => groups[v.status]?.push(v));
    return groups;
  }, [filtered]);

  const pieData = Object.entries(statusGroups).map(([status, items]) => ({ name: status, value: items.length }));
  const PIE_COLORS = ['hsl(152 70% 45%)', 'hsl(38 92% 55%)', 'hsl(210 80% 55%)', 'hsl(0 72% 55%)', 'hsl(220 15% 35%)'];

  const smartAlerts = useMemo(() => {
    const alerts: string[] = [];
    vehicles.forEach(v => {
      if (v.fuelLevel < 30) alerts.push(`⛽ ${v.plate} fuel critically low (${v.fuelLevel}%)`);
      if (v.healthScore < 60) alerts.push(`🔧 ${v.plate} health score deteriorating (${v.healthScore})`);
    });
    drivers.forEach(d => {
      const exp = new Date(d.licenseExpiry);
      if (exp < new Date()) alerts.push(`🔴 ${d.name} license EXPIRED`);
      else if (exp.getTime() - Date.now() < 90 * 86400000) alerts.push(`⚠️ ${d.name} license expiring soon`);
    });
    return alerts.slice(0, 6);
  }, [vehicles, drivers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Command Center</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'hsl(215 15% 55%)' }}>Welcome back, {user?.name}</p>
            {isUsingMockData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                Mock Data Mode
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSelectedRegion(null)} className={`chip ${!selectedRegion ? 'chip-primary' : 'chip-neutral'} cursor-pointer transition-all`}>
            All Regions
          </button>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setSelectedRegion(r)} className={`chip ${selectedRegion === r ? 'chip-primary' : 'chip-neutral'} cursor-pointer transition-all`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Fleet" value={activeFleet} icon={Truck} color="hsl(190, 90%, 50%)" delay={0} />
        <KPICard label="Maintenance Alerts" value={maintenanceAlerts} icon={AlertTriangle} color="hsl(38, 92%, 55%)" delay={100} />
        <KPICard label="Utilization Rate" value={utilization} suffix="%" icon={Gauge} color="hsl(152, 70%, 45%)" delay={200} />
        <KPICard label="Pending Cargo" value={pendingCargo} icon={Package} color="hsl(210, 80%, 55%)" delay={300} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Fleet Status - Discord style */}
        <div className="lg:col-span-3 glass-card p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Fleet Status</h3>
          {(Object.entries(statusGroups) as [VehicleStatus, typeof filtered][]).map(([status, items]) => (
            items.length > 0 && (
              <div key={status} className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase" style={{ color: 'hsl(215 15% 55%)' }}>
                  <span>{getVehicleStatusDot(status)}</span>
                  <span>{status}</span>
                  <span className="ml-auto opacity-60">{items.length}</span>
                </div>
                <div className="space-y-1">
                  {items.map(v => (
                    <div key={v.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer" style={{ color: 'hsl(210 40% 85%)' }} onMouseOver={e => e.currentTarget.style.background = 'hsl(220 20% 14%)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <Truck size={14} style={{ color: 'hsl(190 90% 50%)' }} />
                      <span className="font-mono text-xs">{v.plate}</span>
                      <span className="ml-auto text-xs opacity-50">{v.region}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Center - Utilization + Trips */}
        <div className="lg:col-span-5 space-y-4">
          {/* Utilization donut */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Fleet Distribution</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(220 20% 12%)', border: '1px solid hsl(220 15% 22%)', borderRadius: '12px', color: 'hsl(210 40% 95%)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span style={{ color: 'hsl(210 40% 85%)' }}>{d.name}</span>
                    <span className="ml-auto font-mono font-bold" style={{ color: 'hsl(210 40% 95%)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active trips progress */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Active Trips</h3>
            <div className="space-y-4">
              {trips.filter(t => t.status === 'In Transit' || t.status === 'Dispatched').slice(0, 4).map(t => {
                const v = vehicles.find(ve => ve.id === t.vehicleId);
                return (
                  <div key={t.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium" style={{ color: 'hsl(210 40% 90%)' }}>{v?.plate || 'N/A'}: {t.pickup} → {t.drop}</span>
                      <span className="font-mono text-xs" style={{ color: 'hsl(190 90% 50%)' }}>{t.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right - Activity Feed */}
        <div className="lg:col-span-4 glass-card p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Live Activity</h3>
          <div className="space-y-1">
            {events.map((e, i) => (
              <div key={e.id + i} className="feed-item animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="text-lg flex-shrink-0">{e.icon || '📡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'hsl(210 40% 85%)' }}>{e.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215 15% 45%)' }}>{e.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Alerts */}
      {smartAlerts.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} style={{ color: 'hsl(38 92% 55%)' }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(38 92% 55%)' }}>Smart Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {smartAlerts.map((a, i) => (
              <div key={i} className="p-3 rounded-xl text-sm" style={{ background: 'hsl(38 92% 55% / 0.08)', color: 'hsl(210 40% 85%)' }}>{a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
