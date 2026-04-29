import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3"
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        ))}
      </div>
    </motion.div>
  );
}
