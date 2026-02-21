import React, { useMemo, useState, useCallback } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { REGIONS } from '@/data/mockData';
import { useCountUp } from '@/hooks/useCountUp';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Download, FileText, Shield } from 'lucide-react';
import jsPDF from 'jspdf';

const CHART_STYLE = { background: 'hsl(220 20% 12%)', border: '1px solid hsl(220 15% 22%)', borderRadius: '12px', color: 'hsl(210 40% 95%)' };

export default function Analytics() {
  const { vehicles, trips, maintenance, drivers, loading } = useFleet();
  const { hasPermission } = useAuth();
  const [regionFilter, setRegionFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  const filteredTrips = useMemo(() => {
    let t = trips.filter(tr => tr.status === 'Completed');
    if (vehicleFilter) t = t.filter(tr => tr.vehicleId === vehicleFilter);
    if (regionFilter) {
      const regionVehicles = vehicles.filter(v => v.region === regionFilter).map(v => v.id);
      t = t.filter(tr => regionVehicles.includes(tr.vehicleId));
    }
    return t;
  }, [trips, regionFilter, vehicleFilter, vehicles]);

  const totalFuel = useMemo(() => filteredTrips.reduce((s, t) => s + (t.fuelCost || 0), 0), [filteredTrips]);
  const totalDistance = useMemo(() => filteredTrips.reduce((s, t) => s + t.distance, 0), [filteredTrips]);

  const filteredMaint = useMemo(() => {
    let m = maintenance;
    if (vehicleFilter) m = m.filter(r => r.vehicleId === vehicleFilter);
    if (regionFilter) {
      const rv = vehicles.filter(v => v.region === regionFilter).map(v => v.id);
      m = m.filter(r => rv.includes(r.vehicleId));
    }
    return m;
  }, [maintenance, vehicleFilter, regionFilter, vehicles]);

  const totalMaint = useMemo(() => filteredMaint.reduce((s, m) => s + m.cost, 0), [filteredMaint]);

  const fuelEfficiency = useMemo(() => {
    const totalFuelUsed = filteredTrips.reduce((s, t) => s + (t.fuelUsed || 0), 0);
    return totalDistance > 0 ? (totalDistance / Math.max(totalFuelUsed, 1)).toFixed(1) : '0';
  }, [totalDistance, filteredTrips]);

  const roiData = useMemo(() => {
    return vehicles.filter(v => !regionFilter || v.region === regionFilter).slice(0, 8).map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
      const revenue = vTrips.length * 2000;
      const vMaint = maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
      const vFuel = vTrips.reduce((s, t) => s + (t.fuelCost || 0), 0);
      const roi = v.acquisitionCost > 0 ? ((revenue - vMaint - vFuel) / v.acquisitionCost * 100).toFixed(0) : '0';
      return { name: v.plate, roi: Number(roi), revenue, cost: vMaint + vFuel };
    });
  }, [vehicles, trips, maintenance, regionFilter]);

  const monthly = useMemo(() => [
    { month: 'Sep', revenue: 18000, cost: 6500 },
    { month: 'Oct', revenue: 22000, cost: 7200 },
    { month: 'Nov', revenue: 19000, cost: 5800 },
    { month: 'Dec', revenue: 25000, cost: 8100 },
    { month: 'Jan', revenue: 28000, cost: 9500 },
    { month: 'Feb', revenue: 24000, cost: totalFuel + totalMaint },
  ], [totalFuel, totalMaint]);

  const animatedFuel = useCountUp(totalFuel);

  const exportCSV = useCallback(() => {
    const headers = ['Trip ID', 'Vehicle', 'Pickup', 'Drop', 'Distance', 'Fuel Cost', 'Status'];
    const rows = filteredTrips.map(t => {
      const v = vehicles.find(ve => ve.id === t.vehicleId);
      return [t.id, v?.plate || '', t.pickup, t.drop, t.distance, t.fuelCost || 0, t.status];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fleet_report.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [filteredTrips, vehicles]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FleetOps Analytics Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.setFontSize(12);
    doc.text('Summary', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total Fuel Cost: $${totalFuel.toLocaleString()}`, 20, 55);
    doc.text(`Total Maintenance Cost: $${totalMaint.toLocaleString()}`, 20, 62);
    doc.text(`Total Distance: ${totalDistance.toLocaleString()} mi`, 20, 69);
    doc.text(`Fuel Efficiency: ${fuelEfficiency} mi/gal`, 20, 76);
    doc.text(`Completed Trips: ${filteredTrips.length}`, 20, 83);

    let y = 100;
    doc.setFontSize(12);
    doc.text('Trip Details', 20, y);
    y += 10;
    doc.setFontSize(8);
    filteredTrips.slice(0, 30).forEach(t => {
      const v = vehicles.find(ve => ve.id === t.vehicleId);
      doc.text(`${v?.plate || 'N/A'} | ${t.pickup} → ${t.drop} | ${t.distance}mi | $${t.fuelCost || 0}`, 20, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save('fleet_report.pdf');
  }, [filteredTrips, vehicles, totalFuel, totalMaint, totalDistance, fuelEfficiency]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg" style={{ color: 'hsl(210 40% 95%)' }}>Loading Analytics...</p>
      </div>
    );
  }

  if (!hasPermission('viewFinancialReports')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-8">
          <Shield size={48} className="mx-auto mb-4" style={{ color: 'hsl(0 72% 55%)' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'hsl(210 40% 95%)' }}>Access Denied</h2>
          <p className="text-sm" style={{ color: 'hsl(215 15% 55%)' }}>You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 95%)' }}>Operational Analytics</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="input-dark w-auto">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="input-dark w-auto">
            <option value="">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
          </select>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">CSV</button>
          <button onClick={exportPDF} className="btn-primary flex items-center gap-2"><FileText size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fuel Efficiency', value: `${fuelEfficiency} mi/gal`, color: 'hsl(190 90% 50%)' },
          { label: 'Completed Trips', value: filteredTrips.length.toString(), color: 'hsl(152 70% 45%)' },
          { label: 'Total Cost', value: `$${(totalFuel + totalMaint).toLocaleString()}`, color: 'hsl(38 92% 55%)' },
          { label: 'Total Distance', value: `${totalDistance.toLocaleString()} mi`, color: 'hsl(210 80% 55%)' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <p className="text-xs mb-2" style={{ color: 'hsl(215 15% 55%)' }}>{kpi.label}</p>
            <p className="kpi-value text-xl" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Revenue vs Cost Trend</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(152 70% 45%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cost" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Vehicle ROI</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Bar dataKey="roi" fill="hsl(190 90% 50%)" radius={[6, 6, 0, 0]} name="ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
