import { useState, useCallback } from 'react';
import { parseSSEStream } from '../utils/streamParser.js';

const STORAGE_KEY = 'amulya-ai-chats';

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Load chats from localStorage
 */
function loadChats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save chats to localStorage
 */
function saveChats(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.warn('Failed to save chats:', e);
  }
}

/**
 * Custom hook for managing chat state, streaming, and persistence.
 */
export function useChat() {
  const [chats, setChats] = useState(() => loadChats());
  const [activeChatId, setActiveChatId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Get the active chat
  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages = activeChat?.messages || [];

  // Persist chats whenever they change
  const persistChats = useCallback((updatedChats) => {
    setChats(updatedChats);
    saveChats(updatedChats);
  }, []);

  /**
   * Create a new chat
   */
  const createNewChat = useCallback(() => {
    const newChat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newChat, ...chats];
    persistChats(updated);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [chats, persistChats]);

  /**
   * Delete a chat
   */
  const deleteChat = useCallback((chatId) => {
    const updated = chats.filter(c => c.id !== chatId);
    persistChats(updated);
    if (activeChatId === chatId) {
      setActiveChatId(updated.length > 0 ? updated[0].id : null);
    }
  }, [chats, activeChatId, persistChats]);

  /**
   * Send a message and stream the AI response
   */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    let chatId = activeChatId;

    // Create new chat if none active
    if (!chatId) {
      const newChat = {
        id: generateId(),
        title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      chatId = newChat.id;
      const updated = [newChat, ...chats];
      persistChats(updated);
      setActiveChatId(chatId);
    }

    // Add user message
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Add AI placeholder message
    const aiMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const isFirstMessage = chat.messages.length === 0;
          return {
            ...chat,
            title: isFirstMessage ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : chat.title,
            messages: [...chat.messages, userMessage, aiMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });
      saveChats(updated);
      return updated;
    });

    setIsStreaming(true);

    try {
      // Build history for context (last 20 messages)
      const currentChat = chats.find(c => c.id === chatId);
      const history = (currentChat?.messages || []).slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      await parseSSEStream(
        response,
        // onChunk — append streamed text
        (chunk) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.role === 'assistant') {
                  msgs[msgs.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + chunk,
                  };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            saveChats(updated);
            return updated;
          });
        },
        // onDone
        () => {
          setIsStreaming(false);
        },
        // onError
        (error) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.role === 'assistant') {
                  msgs[msgs.length - 1] = {
                    ...lastMsg,
                    content: `⚠️ Error: ${error}. Please try again.`,
                  };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            saveChats(updated);
            return updated;
          });
          setIsStreaming(false);
        }
      );
    } catch (error) {
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === chatId) {
            const msgs = [...chat.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...lastMsg,
                content: `⚠️ Connection error: ${error.message}. Make sure the backend server is running.`,
              };
            }
            return { ...chat, messages: msgs };
          }
          return chat;
        });
        saveChats(updated);
        return updated;
      });
      setIsStreaming(false);
    }
  }, [activeChatId, chats, isStreaming, persistChats]);

  /**
   * Upload a file and stream the AI analysis
   */
  const uploadFile = useCallback(async (file, prompt = '') => {
    if (isStreaming) return;

    let chatId = activeChatId;

    if (!chatId) {
      const newChat = {
        id: generateId(),
        title: `File: ${file.name}`,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      chatId = newChat.id;
      const updated = [newChat, ...chats];
      persistChats(updated);
      setActiveChatId(chatId);
    }

    // Add user message showing file upload
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: `📎 Uploaded: **${file.name}** (${(file.size / 1024).toFixed(1)} KB)${prompt ? `\n\n${prompt}` : ''}`,
      timestamp: new Date().toISOString(),
    };

    const aiMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage, aiMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });
      saveChats(updated);
      return updated;
    });

    setIsStreaming(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (prompt) formData.append('prompt', prompt);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      await parseSSEStream(
        response,
        (chunk) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.role === 'assistant') {
                  msgs[msgs.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + chunk,
                  };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            saveChats(updated);
            return updated;
          });
        },
        () => setIsStreaming(false),
        (error) => {
          setChats(prev => {
            const updated = prev.map(chat => {
              if (chat.id === chatId) {
                const msgs = [...chat.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.role === 'assistant') {
                  msgs[msgs.length - 1] = {
                    ...lastMsg,
                    content: `⚠️ Error analyzing file: ${error}`,
                  };
                }
                return { ...chat, messages: msgs };
              }
              return chat;
            });
            saveChats(updated);
            return updated;
          });
          setIsStreaming(false);
        }
      );
    } catch (error) {
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === chatId) {
            const msgs = [...chat.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...lastMsg,
                content: `⚠️ Upload failed: ${error.message}`,
              };
            }
            return { ...chat, messages: msgs };
          }
          return chat;
        });
        saveChats(updated);
        return updated;
      });
      setIsStreaming(false);
    }
  }, [activeChatId, chats, isStreaming, persistChats]);

  return {
    chats,
    activeChatId,
    activeChat,
    messages,
    isStreaming,
    setActiveChatId,
    setChats,
    createNewChat,
    deleteChat,
    sendMessage,
    uploadFile,
  };
}
