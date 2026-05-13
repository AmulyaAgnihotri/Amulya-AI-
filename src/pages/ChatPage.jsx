import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import InputBar from '../components/InputBar.jsx';
import WelcomeScreen from '../components/WelcomeScreen.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { useChat } from '../hooks/useChat.js';
import { parseSSEStream } from '../utils/streamParser.js';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'imagine' | 'voice' | 'search'
  const {
    chats, activeChatId, activeChat, messages, isStreaming,
    setActiveChatId, createNewChat, deleteChat, sendMessage, uploadFile,
    setChats,
  } = useChat();

  /**
   * Handle Imagine mode — streams from /api/imagine/stream
   * and displays the creative response in the chat
   */
  const handleImagine = useCallback(async (prompt) => {
    if (!prompt.trim() || isStreaming) return;

    // Use the regular chat mechanism but with a special prefix
    // so the AI knows it's an imagine request
    const imaginePrompt = `🎨 **Imagine:** ${prompt}\n\nPlease create a detailed, vivid visual design concept for this. Include colors, composition, style, lighting, mood, typography, and layout details. Be extremely creative and descriptive.`;

    // We'll use the streaming imagine endpoint directly
    let chatId = activeChatId;
    if (!chatId) {
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const newChat = {
        id: newId,
        title: `🎨 ${prompt.substring(0, 40)}...`,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      chatId = newId;
      setChats(prev => {
        const updated = [newChat, ...prev];
        try { localStorage.setItem('amulya-ai-chats', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setActiveChatId(chatId);
    }

    const userMessage = {
      id: Date.now().toString(36) + 'u',
      role: 'user',
      content: `🎨 **Imagine:** ${prompt}`,
      timestamp: new Date().toISOString(),
    };

    const aiMessage = {
      id: Date.now().toString(36) + 'a',
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            title: chat.messages.length === 0 ? `🎨 ${prompt.substring(0, 40)}...` : chat.title,
            messages: [...chat.messages, userMessage, aiMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });
      try { localStorage.setItem('amulya-ai-chats', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      const response = await fetch('/api/imagine/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imaginePrompt }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      await parseSSEStream(
        response,
        (chunk) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const last = msgs[msgs.length - 1];
                if (last.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            try { localStorage.setItem('amulya-ai-chats', JSON.stringify(updated)); } catch {}
            return updated;
          });
        },
        () => {},
        (error) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const last = msgs[msgs.length - 1];
                if (last.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, content: `⚠️ Imagine error: ${error}` };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            try { localStorage.setItem('amulya-ai-chats', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      );
    } catch (error) {
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === chatId) {
            const msgs = [...chat.messages];
            const last = msgs[msgs.length - 1];
            if (last.role === 'assistant') {
              msgs[msgs.length - 1] = { ...last, content: `⚠️ Failed to connect to Imagine API: ${error.message}` };
            }
            return { ...chat, messages: msgs };
          }
          return chat;
        });
        try { localStorage.setItem('amulya-ai-chats', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
  }, [activeChatId, isStreaming, setChats, setActiveChatId]);

  const isEmpty = messages.length === 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-screen bg-black overflow-hidden">
      <Sidebar
        chats={chats} activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setSidebarOpen(false); }}
        onNewChat={() => { createNewChat(); setSidebarOpen(false); }}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        mode={mode} onSetMode={setMode}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar onToggleSidebar={() => setSidebarOpen(p => !p)} messages={messages} chatTitle={activeChat?.title} mode={mode} onSetMode={setMode} />
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <WelcomeScreen mode={mode} />
            <div className="w-full mt-10">
              <InputBar onSendMessage={sendMessage} onUploadFile={uploadFile} isStreaming={isStreaming} mode={mode} onImagine={handleImagine} />
            </div>
          </div>
        ) : (
          <>
            <ChatArea messages={messages} isStreaming={isStreaming} onSendMessage={sendMessage} />
            <div className="shrink-0 pb-5 pt-2 bg-black">
              <InputBar onSendMessage={sendMessage} onUploadFile={uploadFile} isStreaming={isStreaming} mode={mode} onImagine={handleImagine} />
            </div>
          </>
        )}
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </motion.div>
  );
}
