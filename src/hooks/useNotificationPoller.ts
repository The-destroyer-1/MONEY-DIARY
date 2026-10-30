import { useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";

export const useNotificationPoller = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // Poll for notifications every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();

        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notif: any) => {
            addNotification({
              title: notif.title,
              message: notif.message,
              type: notif.type || "info",
              deviceSource: notif.deviceSource,
            });
          });
        }
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [addNotification]);
};
