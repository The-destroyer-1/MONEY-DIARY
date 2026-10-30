import { Outfit } from "next/font/google";
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { ChatProvider } from "@/context/ChatContext";
import { NotificationProvider } from "@/context/NotificationContext";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <NotificationProvider>
          <AuthProvider>
            <ChatProvider>
              <CustomerProvider>
                <ThemeProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </ThemeProvider>
              </CustomerProvider>
            </ChatProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
