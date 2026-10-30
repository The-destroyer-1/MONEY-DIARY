"use client";

import React from "react";
import { useMessageSync } from "@/hooks/useMessageSync";

export const MessageSyncInitializer: React.FC = () => {
  useMessageSync();
  return null;
};
