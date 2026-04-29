import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Loader2 } from 'lucide-react';

export default function CodeRunner({ code, language }) {
  const [output, setOutput] = useState(null);
  const [showOutput, setShowOutput] = useState(false);

  const canRun = useMemo(() => {
    return ['javascript', 'js', 'jsx', 'html'].includes((language || '').toLowerCase());
  }, [language]);

  const runCode = useCallback(() => {
    if (!canRun) return;
    setShowOutput(true);
    const html = `<!DOCTYPE html><html><head><style>body{background:#0A0A0A;color:#fff;font-family:monospace;font-size:13px;padding:12px;margin:0;white-space:pre-wrap;}</style></head><body><script>
const _l=[];console.log=(...a)=>_l.push(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' '));
console.error=(...a)=>_l.push('ERROR: '+a.join(' '));
try{${code}}catch(e){_l.push('ERROR: '+e)}
document.body.innerHTML=_l.map(t=>'<div>'+(t.startsWith('ERROR')?'<span style=\"color:#ef4444\">'+t+'</span>':'<span style=\"color:#22c55e\">▸ </span>'+t)+'</div>').join('')||'<div style=\"color:#666\">No output</div>';
<\/script></body></html>`;
    setOutput(html);
  }, [code, language, canRun]);

  if (!canRun) return null;

  return (
    <>
      <button onClick={runCode} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-[#2A2A2A] text-[#8B8B8B] hover:text-emerald-400 transition-colors">
        <Play size={12} /> Run
      </button>
      <AnimatePresence>
        {showOutput && output && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-[#333]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0D0D0D]">
              <span className="text-xs text-[#8B8B8B]">Output</span>
              <button onClick={() => setShowOutput(false)} className="text-[#8B8B8B] hover:text-white"><X size={12} /></button>
            </div>
            <iframe srcDoc={output} sandbox="allow-scripts" className="w-full bg-[#0A0A0A] border-0" style={{ minHeight: '60px', maxHeight: '200px' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
