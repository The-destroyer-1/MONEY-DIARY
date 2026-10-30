"use client";

import React from "react";
import { useNotificationPoller } from "@/hooks/useNotificationPoller";

export const NotificationPollerInitializer: React.FC = () => {
  useNotificationPoller();
  return null;
};
