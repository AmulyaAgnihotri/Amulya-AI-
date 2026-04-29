import React, { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Volume2, VolumeX, MoreHorizontal, Share, CornerDownRight, Play } from 'lucide-react';
import CodeRunner from './CodeRunner.jsx';
import { useVoice } from '../hooks/useVoice.js';

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const handleCopy = useCallback(async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [code]);
  const customStyle = { ...vscDarkPlus, 'pre[class*="language-"]': { ...vscDarkPlus['pre[class*="language-"]'], background: '#0A0A0A', margin: 0, padding: '16px', fontSize: '13px', lineHeight: '1.6' } };

  return (
    <div className="code-block-wrapper my-3">
      <div className="code-block-header">
        <span className="text-xs font-medium uppercase tracking-wider">{language || 'text'}</span>
        <div className="flex items-center gap-1">
          <CodeRunner code={code} language={language} />
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#2A2A2A] text-[#8B8B8B] hover:text-white transition-colors">
            {copied ? <><Check size={12} className="text-emerald-400" /><span className="text-xs text-emerald-400">Copied</span></> : <><Copy size={12} /><span className="text-xs">Copy</span></>}
          </button>
        </div>
      </div>
      <SyntaxHighlighter style={customStyle} language={language || 'text'} PreTag="div" wrapLines>{code}</SyntaxHighlighter>
    </div>
  );
}

const mdComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && (match || String(children).includes('\n'))) return <CodeBlock language={match?.[1]}>{children}</CodeBlock>;
    return <code className={className} {...props}>{children}</code>;
  },
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-[15px]">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed text-[15px]">{children}</li>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">{children}</a>,
};

function ResponseActions({ content }) {
  const [liked, setLiked] = useState(null);
  const [copied, setCopied] = useState(false);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const handleCopy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="flex items-center gap-0.5 mt-3 text-[#6B6B6B]">
      <Btn icon={Copy} tip="Copy" onClick={handleCopy} active={copied} />
      <Btn icon={Share} tip="Share" />
      <Btn icon={ThumbsUp} tip="Good" onClick={() => setLiked(liked === 'up' ? null : 'up')} active={liked === 'up'} />
      <Btn icon={ThumbsDown} tip="Bad" onClick={() => setLiked(liked === 'down' ? null : 'down')} active={liked === 'down'} />
      <Btn icon={RefreshCw} tip="Retry" />
      <Btn icon={isSpeaking ? VolumeX : Volume2} tip={isSpeaking ? 'Stop' : 'Read aloud'} onClick={() => isSpeaking ? stopSpeaking() : speak(content)} active={isSpeaking} />
      <Btn icon={MoreHorizontal} tip="More" />
    </div>
  );
}

function Btn({ icon: Icon, tip, onClick, active }) {
  return <button onClick={onClick} title={tip} className={`p-1.5 rounded-md hover:bg-[#202020] hover:text-white transition-colors ${active ? 'text-white' : ''}`}><Icon size={15} /></button>;
}

function Suggestions({ message, onSendMessage }) {
  if (!message || message.length < 50) return null;
  const lower = message.toLowerCase();
  let s = ['Tell me more', 'Show an example'];
  if (lower.includes('react') || lower.includes('component')) s = ['Show advanced example', 'Add TypeScript types'];
  else if (lower.includes('function') || lower.includes('code')) s = ['Optimize this code', 'Add error handling'];
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {s.map((t, i) => (
        <button key={i} onClick={() => onSendMessage?.(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#8B8B8B] border border-[#333] hover:border-[#555] hover:text-white transition-colors">
          <CornerDownRight size={12} /> {t}
        </button>
      ))}
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({ message, index, onSendMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? 'bg-[#202020]' : ''}`}>
        {!isUser ? (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M14.5 9L9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 12L20 4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
        ) : <img src="https://ui-avatars.com/api/?name=A&background=333&color=fff&size=28" alt="U" className="w-full h-full rounded-full" />}
      </div>
      <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="bg-[#202020] px-4 py-2.5 rounded-2xl text-[15px] text-white leading-relaxed whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            <div className="markdown-content text-white w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{message.content || '▊'}</ReactMarkdown>
            </div>
            {message.content && message.content.length > 1 && (
              <>
                <ResponseActions content={message.content} />
                <Suggestions message={message.content} onSendMessage={onSendMessage} />
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});

export default MessageBubble;
