import React from 'react';
import { Sparkles, Ghost, Menu, MoreHorizontal, PenSquare } from 'lucide-react';
import ExportMenu from './ExportMenu.jsx';

export default function TopBar({ onToggleSidebar, messages, chatTitle, mode, onSetMode }) {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-30 pointer-events-none">
      <div className="pointer-events-auto lg:hidden">
        <button onClick={onToggleSidebar} className="p-2 rounded-lg text-white hover:bg-[#202020] transition-colors">
          <Menu size={20} />
        </button>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1 pointer-events-auto">
        {/* Imagine toggle — highlighted when active */}
        <button onClick={() => onSetMode?.(mode === 'imagine' ? 'chat' : 'imagine')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'imagine' ? 'bg-purple-500/20 text-purple-300' : 'text-white hover:bg-[#202020]'}`}>
          <Sparkles size={16} /> Imagine
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#202020] transition-colors">
          <Ghost size={16} /> Private
        </button>
        <div className="w-px h-5 bg-[#333] mx-1" />
        <button className="p-2 rounded-lg text-white hover:bg-[#202020] transition-colors">
          <MoreHorizontal size={18} />
        </button>
        <ExportMenu messages={messages} title={chatTitle} />
        <button className="p-2 rounded-lg text-white hover:bg-[#202020] transition-colors">
          <PenSquare size={18} />
        </button>
      </div>
    </div>
  );
}
