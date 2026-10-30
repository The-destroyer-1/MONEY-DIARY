"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChatComponent from "@/components/ChatComponent";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Network Chat" />
      <ChatComponent />
    </div>
  );
}
