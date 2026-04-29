import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code2, Bug, FolderSearch, Brain, ArrowRight, Check, Sparkles } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const features = [
  { icon: Code2, title: 'Code Assistant', desc: 'Get instant solutions with clean, production-ready code and clear explanations.' },
  { icon: Bug, title: 'Debugging Engine', desc: 'Upload buggy code and receive deep analysis, fixes, and optimization tips.' },
  { icon: FolderSearch, title: 'Project Analyzer', desc: 'Upload files for comprehensive code review and architecture analysis.' },
  { icon: Brain, title: 'Memory System', desc: 'Contextual conversations that remember your project context.' },
];

const pricing = [
  {
    name: 'Free', price: '$0', period: '/month', desc: 'Get started',
    features: ['50 messages/day', 'Code assistance', 'Basic file analysis', 'Chat history'],
    cta: 'Get Started', highlighted: false,
  },
  {
    name: 'Pro', price: '$19', period: '/month', desc: 'For professionals',
    features: ['Unlimited messages', 'Priority streaming', 'Advanced file analysis', 'PDF summarization', 'Priority support', 'Custom prompts'],
    cta: 'Upgrade to Pro', highlighted: true,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between bg-black/80 backdrop-blur-md border border-[#222] rounded-2xl px-6 py-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
            <span className="font-bold text-white tracking-tight">Amulya AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/chat')}
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors">
            Launch App
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#333] bg-[#111] mb-8 text-xs text-white/80 font-medium">
              <Sparkles size={12} /> Powered by DeepSeek V4 Pro
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-6 text-white">
            Build at the<br />speed of thought.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-white/40 max-w-xl mx-auto mb-10">
            Your minimalist AI developer workspace. Write code, debug, and ship — faster.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/chat')}
              className="px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
              Start Building <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-16">Everything you need</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-[#111] border border-[#222] hover:border-[#444] transition-all cursor-default">
                <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-16">Simple pricing</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pricing.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`p-8 rounded-2xl border transition-all ${plan.highlighted ? 'bg-[#111] border-white/20' : 'bg-[#0A0A0A] border-[#222]'}`}>
                {plan.highlighted && <div className="text-xs font-bold text-black bg-white px-3 py-1 rounded-full w-fit mb-4">Popular</div>}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-white/40 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                      <Check size={14} className="text-white shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/chat')}
                  className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${plan.highlighted ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#1A1A1A] text-white border border-[#333] hover:border-[#555]'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#222]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
            <span className="text-sm font-semibold tracking-tight">Amulya AI</span>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Amulya AI</p>
        </div>
      </footer>
    </motion.div>
  );
}
