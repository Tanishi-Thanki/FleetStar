import { useMemo, useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useCountUp } from '@/hooks/useCountUp';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Fuel, Wrench, TrendingUp, X, Truck } from 'lucide-react';

const CHART_STYLE = { background: 'hsl(220 20% 12%)', border: '1px solid hsl(220 15% 22%)', borderRadius: '12px', color: 'hsl(210 40% 95%)' };

export default function CompletedTrips() {
  const { trips, vehicles, maintenance, loading } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const mostExpensive = useMemo(() => {
    const costs: Record<string, number> = {};
    const completed = trips.filter(t => t.status === 'Completed');
    completed.forEach(t => { costs[t.vehicleId] = (costs[t.vehicleId] || 0) + (t.fuelCost || 0); });
    maintenance.forEach(m => { costs[m.vehicleId] = (costs[m.vehicleId] || 0) + m.cost; });
    const max = Object.entries(costs).sort((a, b) => b[1] - a[1])[0];
    return max ? vehicles.find(v => v.id === max[0])?.plate || 'N/A' : 'N/A';
  }, [trips, maintenance, vehicles]);

  const completedTrips = useMemo(() => trips.filter(t => t.status === 'Completed'), [trips]);
  const totalFuelCost = useMemo(() => completedTrips.reduce((s, t) => s + (t.fuelCost || 0), 0), [completedTrips]);
  const totalMaintCost = useMemo(() => maintenance.reduce((s, m) => s + m.cost, 0), [maintenance]);
  const totalOps = totalFuelCost + totalMaintCost;
  const totalKm = useMemo(() => completedTrips.reduce((s, t) => s + t.distance, 0), [completedTrips]);
  const costPerKm = totalKm > 0 ? totalOps / totalKm : 0;

  const animatedFuel = useCountUp(totalFuelCost);
  const animatedMaint = useCountUp(totalMaintCost);
  const animatedOps = useCountUp(totalOps);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Expenses...</p>
      </div>
    );
  }

  const fuelVsMaint = [
    { name: 'Fuel', value: totalFuelCost },
    { name: 'Maintenance', value: totalMaintCost },
  ];

  const monthly = [
    { month: 'Oct', fuel: 1200, maint: 800 },
    { month: 'Nov', fuel: 1500, maint: 1200 },
    { month: 'Dec', fuel: 1100, maint: 600 },
    { month: 'Jan', fuel: 1800, maint: 2500 },
    { month: 'Feb', fuel: totalFuelCost, maint: totalMaintCost },
  ];

  const PIE_COLORS = ['hsl(190 90% 50%)', 'hsl(38 92% 55%)', 'hsl(152 70% 45%)'];
  const distPie = [
    { name: 'Fuel', value: totalFuelCost },
    { name: 'Maintenance', value: totalMaintCost },
    { name: 'Other', value: Math.max(totalOps * 0.1, 100) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Expenses & Fuel Logging</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Fuel Cost', value: `$${animatedFuel.toLocaleString()}`, icon: Fuel, color: 'hsl(190 90% 50%)' },
          { label: 'Total Maint Cost', value: `$${animatedMaint.toLocaleString()}`, icon: Wrench, color: 'hsl(38 92% 55%)' },
          { label: 'Total Ops Cost', value: `$${animatedOps.toLocaleString()}`, icon: DollarSign, color: 'hsl(152 70% 45%)' },
          { label: 'Cost per Mile', value: `$${costPerKm.toFixed(2)}`, icon: TrendingUp, color: 'hsl(210 80% 55%)' },
          { label: 'Most Expensive', value: mostExpensive, icon: Truck, color: 'hsl(0 72% 55%)' },
        ].map((kpi, i) => (
          <div key={kpi.label} className="kpi-card opacity-0 animate-fade-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
            <kpi.icon size={18} style={{ color: kpi.color }} className="mb-3" />
            <p className="kpi-value text-xl" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 55%)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Fuel vs Maintenance</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelVsMaint}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="hsl(190 90% 50%)" />
                  <Cell fill="hsl(38 92% 55%)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Monthly Cost Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="fuel" stroke="hsl(190 90% 50%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="maint" stroke="hsl(38 92% 55%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Cost Distribution</h3>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {distPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={CHART_STYLE} />
                <Legend wrapperStyle={{ color: 'hsl(210 40% 85%)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Completed Trips</h3>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {completedTrips.map(t => {
              const v = vehicles.find(ve => ve.id === t.vehicleId);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors" style={{ background: 'hsl(220 20% 10%)' }} onClick={() => setSelectedVehicleId(t.vehicleId)}>
                  <div>
                    <span className="font-mono text-sm font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>{v?.plate}</span>
                    <p className="text-xs" style={{ color: 'hsl(215 15% 55%)' }}>{t.pickup} → {t.drop}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono" style={{ color: 'hsl(190 90% 50%)' }}>${t.fuelCost || 0}</p>
                    <p className="text-xs" style={{ color: 'hsl(215 15% 55%)' }}>{t.distance} mi</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
