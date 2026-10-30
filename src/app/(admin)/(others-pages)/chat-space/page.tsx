"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useChat } from "@/context/ChatContext";

interface User {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "away";
  avatar: string;
}

const CHAT_USERS: User[] = [
  {
    id: "1",
    name: "HUSSAM",
    role: "Super Admin",
    status: "online",
    avatar: "🔐",
  },
  {
    id: "2",
    name: "Admin",
    role: "Administrator",
    status: "online",
    avatar: "👨‍💼",
  },
  {
    id: "3",
    name: "Info",
    role: "Information Officer",
    status: "away",
    avatar: "ℹ️",
  },
  {
    id: "4",
    name: "Super Admin",
    role: "System Administrator",
    status: "online",
    avatar: "⚙️",
  },
];

export default function ChatSpacePage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("1");
  const [newMessage, setNewMessage] = useState<string>("");
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const { messages, addMessage, deleteMessage } = useChat();
  const currentUser = CHAT_USERS.find((u) => u.id === selectedUserId) || CHAT_USERS[0];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      userId: selectedUserId,
      userName: currentUser.name,
      userRole: currentUser.role,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      avatar: currentUser.avatar,
    };

    addMessage(message);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessage(messageId);
      setHoveredMessageId(null);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Chat Space" />

      <ComponentCard title="Team Chat">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Users List */}
          <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-800 pr-4 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
                Team Members
              </h3>
              {CHAT_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedUserId === user.id
                      ? "bg-brand-500/20 border border-brand-500"
                      : "hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{user.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.role}
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.status === "online"
                          ? "bg-success-500"
                          : user.status === "away"
                          ? "bg-warning-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group ${msg.userId === selectedUserId ? "justify-end" : ""}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {msg.userId !== selectedUserId && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-sm font-semibold text-brand-600 dark:text-brand-400">
                          {msg.avatar}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 items-end">
                      <div
                        className={`max-w-xs lg:max-w-md ${
                          msg.userId === selectedUserId
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200"
                        } rounded-lg px-4 py-2`}
                      >
                        {msg.userId !== selectedUserId && (
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            {msg.userName}
                          </p>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.userId === selectedUserId
                              ? "opacity-70"
                              : "opacity-50 dark:opacity-40"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                      {hoveredMessageId === msg.id && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="flex-shrink-0 p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete message"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={3}
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
