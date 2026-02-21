import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, USERS } from '@/data/mockData';
import { Shield, Eye, EyeOff, Truck } from 'lucide-react';

const ROLES: UserRole[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@fleet.io');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('Admin');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (login(email, password, role)) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials or role mismatch');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 30% 20%, hsl(220 30% 12%), hsl(220 20% 6%) 70%)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, hsl(190 90% 50%), hsl(190 80% 35%))', boxShadow: '0 0 40px hsl(190 90% 50% / 0.3)' }}>
            <Truck size={32} style={{ color: 'hsl(220 20% 6%)' }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-primary">FleetOps</h1>
          <p className="mt-2 text-sm" style={{ color: 'hsl(215 15% 55%)' }}>Fleet Management Command Center</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'hsl(210 40% 95%)' }}>Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="your@email.com" required />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-dark pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215 15% 55%)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'hsl(215 15% 55%)' }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input-dark cursor-pointer">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'hsl(0 72% 55% / 0.1)', color: 'hsl(0 72% 55%)', border: '1px solid hsl(0 72% 55% / 0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Shield size={16} /> Sign In</>
              )}
            </button>
          </form>

          <button className="mt-4 w-full text-center text-sm transition-colors hover:underline" style={{ color: 'hsl(190 90% 50%)' }}>
            Forgot Password?
          </button>

          {/* Demo creds */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'hsl(220 15% 18%)' }}>
            <p className="text-xs mb-3 font-medium" style={{ color: 'hsl(215 15% 55%)' }}>DEMO ACCOUNTS</p>
            <div className="space-y-2">
              {USERS.map(u => (
                <button key={u.id} onClick={() => { setEmail(u.email); setRole(u.role); }} className="w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors" style={{ color: 'hsl(210 40% 80%)' }} onMouseOver={e => e.currentTarget.style.background = 'hsl(220 20% 14%)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'hsl(190 90% 50% / 0.15)', color: 'hsl(190 90% 50%)' }}>{u.avatar}</div>
                  <span className="flex-1 text-left">{u.email}</span>
                  <span className="chip-primary text-[10px]">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
