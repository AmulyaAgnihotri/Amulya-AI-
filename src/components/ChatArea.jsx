import React from 'react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { useAutoScroll } from '../hooks/useAutoScroll.js';

export default function ChatArea({ messages, isStreaming, onSendMessage }) {
  const scrollRef = useAutoScroll([messages, isStreaming]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-16 pb-6 hide-scrollbar">
      <div className="w-full max-w-2xl mx-auto space-y-5">
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} index={index} onSendMessage={onSendMessage} />
        ))}
        <AnimatePresence>
          {isStreaming && messages.length > 0 && messages[messages.length - 1].content === '' && (
            <TypingIndicator />
          )}
        </AnimatePresence>
      </div>
      <div className="h-4" />
    </div>
  );
}
