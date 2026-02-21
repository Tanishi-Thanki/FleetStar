import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Truck, Route, Wrench, Fuel, Users, BarChart3,
  LogOut, ChevronLeft, ChevronRight, Shield, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { path: '/trips', label: 'Trip Dispatcher', icon: Route },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/fuel', label: 'Expenses & Fuel', icon: Fuel },
  { path: '/drivers', label: 'Driver Profiles', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(220 20% 6%)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-full flex flex-col border-r transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: 'hsl(220 22% 8%)', borderColor: 'hsl(220 15% 15%)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'hsl(220 15% 15%)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, hsl(190 90% 50%), hsl(190 80% 35%))', color: 'hsl(220 20% 6%)' }}>
            FM
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight text-gradient-primary">FleetOps</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t px-3 py-4" style={{ borderColor: 'hsl(220 15% 15%)' }}>
          {!collapsed && user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'hsl(190 90% 50% / 0.2)', color: 'hsl(190 90% 50%)' }}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(210 40% 95%)' }}>{user.name}</p>
                <p className="text-xs flex items-center gap-1" style={{ color: 'hsl(215 15% 55%)' }}>
                  <Shield size={10} /> {user.role}
                </p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-nav-item w-full" style={{ color: 'hsl(0 72% 55%)' }}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-nav-item w-full mt-1 hidden lg:flex"
          >
            {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b" style={{ borderColor: 'hsl(220 15% 15%)', background: 'hsl(220 22% 8%)' }}>
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={22} style={{ color: 'hsl(210 40% 95%)' }} />
          </button>
          <span className="font-bold text-gradient-primary">FleetOps</span>
        </div>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
