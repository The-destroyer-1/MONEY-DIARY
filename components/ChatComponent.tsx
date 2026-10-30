"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

export default function ChatComponent() {
  const { messages, sendMessage, deleteMessage, isOnline } = useChat();
  const { isAuthenticated, user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    if (!isAuthenticated || !user) {
      alert("You must be logged in to send messages");
      return;
    }

    setIsLoading(true);

    try {
      sendMessage(
        user.id || "unknown",
        user.name || "Anonymous",
        user.role || "user",
        newMessage,
        user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User")
      );
      setNewMessage("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessage(id);
    }
  };

  return (
    <ComponentCard title="Network Chat">
      <div className="flex flex-col gap-4">
        {/* Online Status Bar */}
        <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
          isOnline
            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
            : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-yellow-500"}`}></span>
          {isOnline ? "Connected - Messages sync across devices" : "Offline - Using local storage"}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700" style={{ maxHeight: "500px" }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.userId === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                {msg.userId !== user?.id && (
                  <img
                    src={msg.avatar}
                    alt={msg.userName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.userId === user?.id
                      ? "bg-brand-500 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  {msg.userId !== user?.id && (
                    <p className="text-xs font-semibold opacity-75">
                      {msg.userName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <div className="flex items-center gap-1 text-xs opacity-60 mt-1">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.userId === user?.id && (
                      <span className="text-green-500" title="Synced to devices">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
                {msg.userId === user?.id && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors self-center"
                    title="Delete message"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isAuthenticated ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-center">
            Please log in to send messages
          </div>
        )}

        {/* Stats */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </div>
      </div>
    </ComponentCard>
  );
}
