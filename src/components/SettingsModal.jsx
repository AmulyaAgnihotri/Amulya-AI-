import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

const THEMES = [
  { id: 'vscDarkPlus', name: 'VS Code Dark' },
  { id: 'oneDark', name: 'One Dark' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'atomDark', name: 'Atom Dark' },
];

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateSettings, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [syntaxTheme, setSyntaxTheme] = useState('vscDarkPlus');
  const [githubToken, setGithubToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setSystemPrompt(user.settings.systemPrompt || '');
      setSyntaxTheme(user.settings.syntaxTheme || 'vscDarkPlus');
      setGithubToken(user.settings.githubToken || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ systemPrompt, syntaxTheme, githubToken });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#222]">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#222] text-[#8B8B8B] hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#222]">
            {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'preferences', label: 'Preferences', icon: Settings }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.id ? 'border-white text-white' : 'border-transparent text-[#8B8B8B] hover:text-white'
                }`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto max-h-[50vh] space-y-5">
            {tab === 'profile' && (
              <>
                <Field label="Name" value={user?.name || 'Guest'} readOnly />
                <Field label="Email" value={user?.email || 'Not logged in'} readOnly />
                <button onClick={() => { logout(); onClose(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            )}

            {tab === 'preferences' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider mb-2">Custom System Prompt</label>
                  <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4}
                    placeholder='e.g. "Always write code in TypeScript" or "Never explain, just give the code"'
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder-[#555] outline-none focus:border-white/30 resize-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider mb-2">Syntax Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => setSyntaxTheme(t.id)}
                        className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                          syntaxTheme === t.id ? 'bg-white text-black font-semibold' : 'bg-[#1A1A1A] text-white/70 hover:bg-[#222]'
                        }`}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider mb-2">GitHub Token (for Gist export)</label>
                  <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder-[#555] outline-none focus:border-white/30 transition-colors" />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? '✓ Saved!' : 'Save Preferences'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, readOnly }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider mb-2">{label}</label>
      <input type="text" value={value} readOnly={readOnly}
        className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white/60 text-sm outline-none cursor-default" />
    </div>
  );
}
