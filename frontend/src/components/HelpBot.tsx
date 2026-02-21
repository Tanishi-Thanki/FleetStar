import { useState, useRef, useEffect } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/data/mockData';
import { MessageCircle, X, Send, Bot, Ticket } from 'lucide-react';

function routeMessage(msg: string): { role: UserRole; category: string } {
  const lower = msg.toLowerCase();
  if (/maintenance|repair|service|engine|brake|tire/i.test(lower)) return { role: 'Fleet Manager', category: 'Maintenance' };
  if (/license|violation|safety|compliance|suspend/i.test(lower)) return { role: 'Safety Officer', category: 'Safety' };
  if (/cost|fuel|expense|budget|invoice|payment/i.test(lower)) return { role: 'Financial Analyst', category: 'Finance' };
  if (/trip|route|assign|dispatch|cargo|deliver/i.test(lower)) return { role: 'Dispatcher', category: 'Operations' };
  return { role: 'Admin', category: 'General' };
}

interface ChatMessage {
  id: string;
  text: string;
  from: 'user' | 'bot';
  timestamp: string;
}

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Hi! I\'m your FleetOps assistant. Describe your issue and I\'ll route it to the right team.', from: 'bot', timestamp: 'Now' }
  ]);
  const [showTickets, setShowTickets] = useState(false);
  const { addTicket, tickets } = useFleet();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const userMsg: ChatMessage = { id: `m${Date.now()}`, text: input, from: 'user', timestamp: 'Now' };
    setMessages(prev => [...prev, userMsg]);

    const { role, category } = routeMessage(input);

    setTimeout(() => {
      const ticketId = `TK-${1000 + tickets.length}`;
      addTicket({
        userId: user.id,
        message: input,
        assignedTo: role,
        assignedRole: role,
        status: 'Open',
        category,
      });

      const botMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        text: `I've created ticket ${ticketId} and routed it to the ${role} team (${category}). They'll get back to you shortly.`,
        from: 'bot',
        timestamp: 'Now',
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);

    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, hsl(190 90% 50%), hsl(190 80% 35%))',
          boxShadow: '0 4px 20px hsl(190 90% 50% / 0.4)',
        }}
      >
        {open ? <X size={22} style={{ color: 'hsl(220 20% 6%)' }} /> : <MessageCircle size={22} style={{ color: 'hsl(220 20% 6%)' }} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] glass-card flex flex-col animate-scale-in" style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'hsl(220 15% 18%)' }}>
            <div className="flex items-center gap-2">
              <Bot size={20} style={{ color: 'hsl(190 90% 50%)' }} />
              <span className="font-semibold text-sm" style={{ color: 'hsl(210 40% 95%)' }}>FleetOps Assistant</span>
            </div>
            <button onClick={() => setShowTickets(!showTickets)} className="chip-info text-[10px] cursor-pointer">
              <Ticket size={12} /> {tickets.length} Tickets
            </button>
          </div>

          {showTickets ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'hsl(215 15% 55%)' }}>Support Tickets</h4>
              {tickets.length === 0 && <p className="text-sm" style={{ color: 'hsl(215 15% 55%)' }}>No tickets yet</p>}
              {tickets.map(t => (
                <div key={t.id} className="p-3 rounded-xl" style={{ background: 'hsl(220 20% 10%)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-semibold" style={{ color: 'hsl(190 90% 50%)' }}>{t.id}</span>
                    <span className={t.status === 'Resolved' ? 'chip-success' : t.status === 'In Progress' ? 'chip-warning' : 'chip-info'} style={{ fontSize: '10px' }}>{t.status}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(210 40% 80%)' }}>{t.message}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'hsl(215 15% 45%)' }}>Assigned: {t.assignedTo} ({t.category})</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] p-3 rounded-2xl text-sm" style={{
                      background: m.from === 'user' ? 'hsl(190 90% 50% / 0.15)' : 'hsl(220 20% 14%)',
                      color: 'hsl(210 40% 90%)',
                      borderBottomRightRadius: m.from === 'user' ? '4px' : undefined,
                      borderBottomLeftRadius: m.from === 'bot' ? '4px' : undefined,
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: 'hsl(220 15% 18%)' }}>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="input-dark flex-1"
                    placeholder="Describe your issue..."
                  />
                  <button onClick={handleSend} className="btn-primary px-3">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
