"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getWebSocketClient, type WebSocketMessage } from "@/utils/websocket";

interface CollaborationContextType {
  isConnected: boolean;
  userCount: number;
  broadcastChange: (type: string, data: any) => void;
  subscribe: (type: string, handler: (data: any) => void) => () => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error("useCollaboration must be used within a CollaborationProvider");
  }
  return context;
};

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(1);

  useEffect(() => {
    const wsClient = getWebSocketClient();

    // Subscribe to connection updates
    const unsubscribeJoined = wsClient.on("user-joined", (data) => {
      console.log("User joined, total:", data.userCount);
      setUserCount(data.userCount);
    });

    const unsubscribeLeft = wsClient.on("user-left", (data) => {
      console.log("User left, total:", data.userCount);
      setUserCount(data.userCount);
    });

    // Attempt to connect
    wsClient
      .connect()
      .then(() => {
        setIsConnected(true);
        console.log("Collaboration connected");
      })
      .catch((error) => {
        console.error("Collaboration connection failed:", error);
        setIsConnected(false);
      });

    return () => {
      unsubscribeJoined();
      unsubscribeLeft();
    };
  }, []);

  const broadcastChange = useCallback((type: string, data: any) => {
    const wsClient = getWebSocketClient();
    wsClient.send({
      type: `change-${type}`,
      data,
    });
  }, []);

  const subscribe = useCallback(
    (type: string, handler: (data: any) => void) => {
      const wsClient = getWebSocketClient();
      return wsClient.on(`change-${type}`, (message: WebSocketMessage) => {
        handler(message.data);
      });
    },
    []
  );

  return (
    <CollaborationContext.Provider
      value={{
        isConnected,
        userCount,
        broadcastChange,
        subscribe,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};
