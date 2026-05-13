import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, FileDown, FileText, Github, Loader2 } from 'lucide-react';
import { exportAsMarkdown, exportAsPDF } from '../utils/exportChat.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ExportMenu({ messages, title }) {
  const [open, setOpen] = useState(false);
  const [gistLoading, setGistLoading] = useState(false);
  const [gistUrl, setGistUrl] = useState('');
  const menuRef = useRef(null);
  const { token } = useAuth();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleGist = async () => {
    if (!token) return alert('Please sign in to export to GitHub Gist.');
    setGistLoading(true);
    try {
      const content = messages.map(m => `## ${m.role === 'user' ? 'You' : 'AI'}\n\n${m.content}`).join('\n\n---\n\n');
      const res = await fetch('/api/gist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ filename: `${title || 'chat'}.md`, content, description: `Chat from Amulya AI` }),
      });
      const data = await res.json();
      if (data.url) {
        setGistUrl(data.url);
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'Failed to create Gist.');
      }
    } catch (err) {
      alert('Gist creation failed.');
    }
    setGistLoading(false);
  };

  if (!messages || messages.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#202020] transition-colors">
        <Share size={15} /> Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden">
            <button onClick={() => { exportAsMarkdown(messages, title); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] transition-colors">
              <FileText size={16} /> Export as Markdown
            </button>
            <button onClick={() => { exportAsPDF(messages, title); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] transition-colors">
              <FileDown size={16} /> Export as PDF
            </button>
            <button onClick={handleGist} disabled={gistLoading}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-50">
              {gistLoading ? <Loader2 size={16} className="animate-spin" /> : <Github size={16} />}
              Create GitHub Gist
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
