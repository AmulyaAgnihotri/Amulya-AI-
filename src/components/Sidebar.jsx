import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, AudioLines, Sparkles, ChevronDown, ChevronLeft, Plus, X, MoreVertical } from 'lucide-react';

export default function Sidebar({ chats = [], activeChatId, onSelectChat, onNewChat, onDeleteChat, isOpen, onClose, onOpenSettings, mode = 'chat', onSetMode }) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-black">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
        <button className="p-1 text-[#8B8B8B] hover:text-white transition-colors flex items-center">
          <ChevronLeft size={14} /><ChevronLeft size={14} className="-ml-1.5" />
        </button>
      </div>
      <div className="px-2 pt-2 space-y-0.5">
        <NavItem icon={Search} label="Search" active={mode === 'search'} onClick={() => onSetMode?.('search')} />
        <NavItem icon={MessageSquare} label="Chat" active={mode === 'chat'} onClick={() => onSetMode?.('chat')} />
        <NavItem icon={AudioLines} label="Voice" active={mode === 'voice'} onClick={() => onSetMode?.('voice')} />
        <NavItem icon={Sparkles} label="Imagine" active={mode === 'imagine'} onClick={() => onSetMode?.('imagine')} />
      </div>
      <div className="mt-5 px-3">
        <button onClick={() => setProjectsOpen(!projectsOpen)} className="flex items-center gap-1 text-sm font-semibold text-white w-full">
          Projects <ChevronDown size={14} className={`text-[#8B8B8B] transition-transform ${projectsOpen ? '' : '-rotate-90'}`} />
        </button>
        {projectsOpen && <button onClick={onNewChat} className="flex items-center gap-2 mt-2 px-1 text-sm text-[#8B8B8B] hover:text-white transition-colors w-full"><Plus size={14} /> New Project</button>}
      </div>
      <div className="mt-5 px-3">
        <button onClick={() => setHistoryOpen(!historyOpen)} className="flex items-center gap-1 text-sm font-semibold text-white w-full">
          History <ChevronDown size={14} className={`text-[#8B8B8B] transition-transform ${historyOpen ? '' : '-rotate-90'}`} />
        </button>
      </div>
      {historyOpen && (
        <div className="flex-1 overflow-y-auto px-2 mt-1 hide-scrollbar" ref={menuRef}>
          <div className="space-y-0.5">
            {chats.map(chat => (
              <div key={chat.id} className="relative group">
                <button onClick={() => { onSelectChat(chat.id); onSetMode?.('chat'); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${activeChatId === chat.id ? 'text-white bg-[#202020]' : 'text-[#8B8B8B] hover:text-white hover:bg-[#202020]/50'}`}>
                  <span className="truncate flex-1 text-left">{chat.title}</span>
                  <span onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                    className={`p-0.5 rounded hover:bg-[#333] shrink-0 ml-2 ${menuOpenId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-colors`}>
                    <MoreVertical size={14} />
                  </span>
                </button>
                <AnimatePresence>
                  {menuOpenId === chat.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-6 top-full mt-1 w-36 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <MenuBtn label="Rename" icon="✏️" onClick={() => setMenuOpenId(null)} />
                      <MenuBtn label="Pin" icon="📌" onClick={() => setMenuOpenId(null)} />
                      <MenuBtn label="Delete" icon="🗑️" onClick={() => { onDeleteChat(chat.id); setMenuOpenId(null); }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          {chats.length > 0 && <button className="mt-2 px-3 text-sm text-[#8B8B8B] hover:text-white transition-colors">See all</button>}
        </div>
      )}
      <div className="mt-auto p-4">
        <button onClick={onOpenSettings} className="w-8 h-8 rounded-full bg-[#202020] overflow-hidden hover:ring-2 hover:ring-white/20 transition-all">
          <img src="https://ui-avatars.com/api/?name=A&background=333&color=fff&size=32" alt="Settings" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-[220px] h-screen flex-col shrink-0 relative z-20">{sidebarContent}</aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="lg:hidden fixed inset-0 bg-black/80 z-40" />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 w-[260px] h-screen z-50 bg-black">
              <div className="absolute top-4 right-4"><button onClick={onClose} className="text-[#8B8B8B] hover:text-white"><X size={20} /></button></div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${active ? 'bg-[#202020] text-white' : 'text-white hover:bg-[#202020]/50'}`}>
      <Icon size={18} /><span>{label}</span>
    </button>
  );
}

function MenuBtn({ label, icon, onClick }) {
  return <button onClick={onClick} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white hover:bg-[#2A2A2A] transition-colors">{icon} {label}</button>;
}
