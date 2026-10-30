"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id?: string;
  username: string;
  password: string;
  name?: string;
  role?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isInitialized: boolean;
  isLocked: boolean;
  showWarning: boolean;
  lockScreen: () => void;
  unlockScreen: (password: string) => boolean;
  dismissWarning: () => void;
  setShowWarning: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user: HUSSAM with password 2026
const DEFAULT_USERS: User[] = [
  {
    username: "HUSSAM",
    password: "2026",
  },
];

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
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !pathname.includes("/signin") && !pathname.includes("/signup")) {
      router.push("/signin");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  const login = (username: string, password: string): boolean => {
    const foundUser = DEFAULT_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userWithDefaults = {
        ...foundUser,
        id: foundUser.id || Date.now().toString(),
        name: foundUser.name || foundUser.username,
        role: foundUser.role || "admin",
        avatar: foundUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.username)}`,
      };
      setUser(userWithDefaults);
      setIsAuthenticated(true);
      localStorage.setItem("auth_user", JSON.stringify(userWithDefaults));
      router.push("/");
      return true;
    }
    return false;
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

  const unlockScreen = (password: string): boolean => {
    if (user && user.password === password) {
      setIsLocked(false);
      setShowWarning(false);
      return true;
    }
    return false;
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
