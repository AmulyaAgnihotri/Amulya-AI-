import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, ChevronDown, Upload, Clock, X, FileText, Sparkles } from 'lucide-react';
import { useVoice } from '../hooks/useVoice.js';

export default function InputBar({ onSendMessage, onUploadFile, isStreaming, mode = 'chat', onImagine }) {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const { isListening, transcript, toggleListening, isSupported } = useVoice();

  useEffect(() => { if (transcript) setInput(prev => prev + transcript); }, [transcript]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setPlusMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = useCallback(() => {
    if (isStreaming) return;
    if (selectedFile) { onUploadFile(selectedFile, input); setSelectedFile(null); setInput(''); return; }
    if (!input.trim()) return;

    if (mode === 'imagine' && onImagine) {
      onImagine(input);
    } else {
      onSendMessage(input);
    }
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, selectedFile, isStreaming, onSendMessage, onUploadFile, mode, onImagine]);

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleInput = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPlusMenuOpen(false); }
  };

  const hasContent = input.trim() || selectedFile;
  const isImagine = mode === 'imagine';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative">
      <AnimatePresence>
        {selectedFile && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-[#202020] w-fit">
            <FileText size={14} className="text-white" />
            <span className="text-xs text-white/80 max-w-[200px] truncate">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="p-0.5 text-[#8B8B8B] hover:text-white"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode indicator pill above input */}
      <AnimatePresence>
        {isImagine && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 w-fit">
            <Sparkles size={12} className="text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">Imagine Mode</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input pill — purple border in imagine mode */}
      <div className={`relative flex items-center rounded-full px-2 py-1 transition-colors ${
        isImagine ? 'bg-[#1A1A1A] border border-purple-500/30' : 'bg-[#1A1A1A] border border-[#2A2A2A]'
      }`}>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setPlusMenuOpen(!plusMenuOpen)} className="p-2.5 rounded-full text-white hover:bg-[#2A2A2A] transition-colors">
            <Plus size={20} />
          </button>
          <AnimatePresence>
            {plusMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] transition-colors">
                  <Upload size={16} /> Upload a file
                </button>
                <button className="flex items-center justify-between w-full px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] transition-colors">
                  <span className="flex items-center gap-3"><Clock size={16} /> Recent</span>
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

        <textarea ref={textareaRef} rows={1} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder={isImagine ? 'Describe what you want to create...' : 'Ask anything'}
          disabled={isStreaming}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 py-3 placeholder-[#6B6B6B] resize-none max-h-40 hide-scrollbar disabled:opacity-50" />

        <div className="flex items-center gap-1 shrink-0 pr-1">
          <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:bg-[#2A2A2A] transition-colors">
            Fast <ChevronDown size={12} />
          </button>

          <button onClick={toggleListening} disabled={!isSupported}
            className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-white hover:bg-[#2A2A2A]'} disabled:opacity-30`}>
            <Mic size={18} />
          </button>

          {/* Send button — purple in imagine mode */}
          <button onClick={handleSend} disabled={!hasContent || isStreaming}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              !hasContent || isStreaming
                ? 'bg-[#303030] text-[#6B6B6B] cursor-not-allowed'
                : isImagine
                  ? 'bg-purple-500 text-white hover:bg-purple-400'
                  : 'bg-white text-black hover:bg-gray-200'
            }`}>
            {isImagine ? (
              <Sparkles size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="8" x2="4" y2="16"/><line x1="8" y1="5" x2="8" y2="19"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="16" y1="5" x2="16" y2="19"/><line x1="20" y1="8" x2="20" y2="16"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
