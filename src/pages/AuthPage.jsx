import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
          </svg>
          <span className="text-3xl font-bold text-white tracking-tight">Amulya AI</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#111] rounded-full p-1 mb-8">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${mode === m ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] outline-none focus:border-white/40 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>

          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] outline-none focus:border-white/40 transition-colors" />

          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-[#666] outline-none focus:border-white/40 transition-colors" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs px-1">{error}</motion.p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Skip / Guest */}
        <button onClick={() => navigate('/chat')} className="w-full mt-4 py-2.5 text-sm text-[#666] hover:text-white transition-colors">
          Continue as guest →
        </button>
      </motion.div>
    </motion.div>
  );
}
