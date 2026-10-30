"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useAutoSave, loadFromLocalStorage } from "@/hooks/useAutoSave";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  timestamp: string;
  avatar: string;
  synced?: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  sendMessage: (userId: string, userName: string, userRole: string, message: string, avatar: string) => void;
  isOnline: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [wsClient, setWsClient] = useState<any>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = loadFromLocalStorage<ChatMessage[]>(
      'chatMessages',
      []
    );
    setMessages(savedMessages);
    setIsInitialized(true);
  }, []);

  // Auto-save messages to localStorage whenever they change
  useAutoSave('chatMessages', messages, 500);

  // Setup WebSocket connection for real-time sync
  useEffect(() => {
    if (!isInitialized) return;

    const initWebSocket = async () => {
      try {
        // Dynamically import WebSocket client to avoid SSR issues
        const { getWebSocketClient } = await import('@/utils/websocket');
        const client = getWebSocketClient();
        
        // Connect to WebSocket
        await client.connect().catch(() => {
          setIsOnline(false);
        });
        
        setWsClient(client);
        setIsOnline(true);

        // Listen for incoming chat messages from other devices
        client.on('chat_message', (data: any) => {
          if (data.message) {
            // Add message from other devices
            const newMessage: ChatMessage = {
              id: data.message.id,
              userId: data.message.userId,
              userName: data.message.userName,
              userRole: data.message.userRole,
              message: data.message.message,
              timestamp: data.message.timestamp,
              avatar: data.message.avatar,
              synced: true,
            };
            
            // Check if message already exists
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === newMessage.id);
              if (!exists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        });

        // Listen for deleted messages
        client.on('chat_delete', (data: any) => {
          if (data.messageId) {
            setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
          }
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('WebSocket not available, using localStorage only');
        setIsOnline(false);
      }
    };

    initWebSocket();

    return () => {
      if (wsClient) {
        wsClient.disconnect();
      }
    };
  }, [isInitialized]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    
    // Broadcast message to other devices via WebSocket
    if (wsClient && isOnline) {
      try {
        wsClient.send({
          type: 'chat_message',
          message: {
            id: message.id,
            userId: message.userId,
            userName: message.userName,
            userRole: message.userRole,
            message: message.message,
            timestamp: message.timestamp,
            avatar: message.avatar,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Failed to broadcast message');
      }
    }
  };

  const sendMessage = (
    userId: string,
    userName: string,
    userRole: string,
    message: string,
    avatar: string
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      userRole,
      message,
      timestamp: new Date().toISOString(),
      avatar,
      synced: false,
    };
    addMessage(newMessage);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    
    // Broadcast deletion to other devices
    if (wsClient && isOnline) {
      try {
        wsClient.send({
          type: 'chat_delete',
          messageId: id,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Failed to broadcast deletion');
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        deleteMessage,
        clearMessages,
        sendMessage,
        isOnline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
