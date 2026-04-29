import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function WelcomeScreen({ mode = 'chat' }) {
  const isImagine = mode === 'imagine';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
      {isImagine ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Sparkles size={32} className="text-purple-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Imagine</h1>
          <p className="text-sm text-white/40">Describe anything and get a detailed visual design concept</p>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 text-white">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
          </svg>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Amulya AI</h1>
        </>
      )}
    </motion.div>
  );
}
