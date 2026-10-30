import { useEffect, useCallback, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useNotification } from "@/context/NotificationContext";
import { getWebSocketClient } from "@/utils/websocket";

interface SyncMessage {
  type: "message-sync" | "message-received" | "device-sync";
  payload: any;
  deviceId: string;
  timestamp: string;
}

export const useMessageSync = () => {
  const { addMessage, messages } = useChat();
  const { addNotification } = useNotification();
  const wsClientRef = useRef(getWebSocketClient());
  const deviceIdRef = useRef<string>("");

  useEffect(() => {
    // Generate unique device ID
    const generateDeviceId = () => {
      const stored = localStorage.getItem("device-id");
      if (stored) {
        deviceIdRef.current = stored;
        return stored;
      }
      const newId = `${navigator.userAgent.split(" ").pop()}-${Date.now()}`;
      localStorage.setItem("device-id", newId);
      deviceIdRef.current = newId;
      return newId;
    };

    generateDeviceId();

    const wsClient = wsClientRef.current;

    // Connect to WebSocket
    wsClient
      .connect()
      .then(() => {
        console.log("Message sync connected");

        // Notify other devices that this device is online
        wsClient.send({
          type: "device-online",
          deviceId: deviceIdRef.current,
          timestamp: new Date().toISOString(),
        });

        // Listen for incoming messages from other devices
        wsClient.on("message-sync", (data: SyncMessage) => {
          if (data.deviceId !== deviceIdRef.current) {
            // This message came from another device
            addMessage(data.payload);

            // Show notification
            addNotification({
              title: "New Message",
              message: `${data.payload.userName}: ${data.payload.message}`,
              type: "info",
              deviceSource: "mobile",
            });
          }
        });

        // Listen for device sync requests
        wsClient.on("device-sync-request", () => {
          // Send current messages to other devices
          wsClient.send({
            type: "device-sync-response",
            payload: messages,
            deviceId: deviceIdRef.current,
            timestamp: new Date().toISOString(),
          });
        });

        // Listen for device online notifications
        wsClient.on("device-online", (data: any) => {
          if (data.deviceId !== deviceIdRef.current) {
            addNotification({
              title: "Device Connected",
              message: `Another device has come online`,
              type: "info",
            });

            // Request sync from the newly connected device
            wsClient.send({
              type: "device-sync-request",
              deviceId: deviceIdRef.current,
              timestamp: new Date().toISOString(),
            });
          }
        });
      })
      .catch((error) => {
        console.error("Failed to connect message sync:", error);
        addNotification({
          title: "Connection Error",
          message: "Failed to connect to message sync server",
          type: "error",
        });
      });

    return () => {
      wsClient.disconnect();
    };
  }, [addMessage, messages, addNotification]);

  const syncMessage = useCallback(
    (message: any) => {
      const wsClient = wsClientRef.current;
      if (wsClient.isConnected()) {
        wsClient.send({
          type: "message-sync",
          payload: message,
          deviceId: deviceIdRef.current,
          timestamp: new Date().toISOString(),
        });
      }
    },
    []
  );

  return { syncMessage, deviceId: deviceIdRef.current };
};
