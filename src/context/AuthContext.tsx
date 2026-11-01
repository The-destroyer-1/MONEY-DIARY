"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id?: string;
  username: string;
  name?: string;
  role?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isInitialized: boolean;
  isLocked: boolean;
  showWarning: boolean;
  lockScreen: () => void;
  unlockScreen: (password: string) => Promise<boolean>;
  dismissWarning: () => void;
  setShowWarning: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsedUser: unknown = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === "object" && "username" in parsedUser && typeof parsedUser.username === "string") {
          const safeUser: User = {
            username: parsedUser.username,
            ...("id" in parsedUser && typeof parsedUser.id === "string" ? { id: parsedUser.id } : {}),
            ...("name" in parsedUser && typeof parsedUser.name === "string" ? { name: parsedUser.name } : {}),
            ...("role" in parsedUser && typeof parsedUser.role === "string" ? { role: parsedUser.role } : {}),
            ...("avatar" in parsedUser && typeof parsedUser.avatar === "string" ? { avatar: parsedUser.avatar } : {}),
          };
          // Restore the browser-only session after hydration.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUser(safeUser);
          setIsAuthenticated(true);
          localStorage.setItem("auth_user", JSON.stringify(safeUser));
        } else {
          localStorage.removeItem("auth_user");
        }
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !pathname.includes("/signin") && !pathname.includes("/signup")) {
      router.push("/signin");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  const login = async (password: string): Promise<boolean> => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const result: unknown = await response.json().catch(() => null);
      const error = result && typeof result === "object" && "error" in result && typeof result.error === "string"
        ? result.error
        : "Could not verify your login. Please try again.";
      throw new Error(error);
    }
    const userWithDefaults: User = {
      id: Date.now().toString(),
      username: "HUSSAM",
      name: "HUSSAM",
      role: "admin",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent("HUSSAM")}`,
    };
    setUser(userWithDefaults);
    setIsAuthenticated(true);
    localStorage.setItem("auth_user", JSON.stringify(userWithDefaults));
    router.push("/");
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    setShowWarning(false);
    localStorage.removeItem("auth_user");
    router.push("/signin");
  };

  const lockScreen = () => {
    setIsLocked(true);
    setShowWarning(false);
  };

  const unlockScreen = async (password: string): Promise<boolean> => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return false;
    setIsLocked(false);
    setShowWarning(false);
    return true;
  };

  const dismissWarning = () => {
    setShowWarning(false);
  };

  const setShowWarningFn = (show: boolean) => {
    setShowWarning(show);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isInitialized, isLocked, showWarning, lockScreen, unlockScreen, dismissWarning, setShowWarning: setShowWarningFn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
