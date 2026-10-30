"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useCollaboration } from "./CollaborationContext";
import { useAutoSave, loadFromLocalStorage } from "@/hooks/useAutoSave";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  truckNo: string;
  destination: string;
  info: string;
  status: "active" | "inactive";
  orders: number;
  totalSpent: number;
  joinDate: string;
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getTotalCustomers: () => number;
  getTotalOrders: () => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Default customer data
const DEFAULT_CUSTOMERS: Customer[] = [];

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load customers from localStorage on mount
  useEffect(() => {
    const savedCustomers = loadFromLocalStorage<Customer[]>(
      'customers',
      DEFAULT_CUSTOMERS
    );
    setCustomers(savedCustomers);
    setIsInitialized(true);
  }, []);

  // Auto-save customers to localStorage whenever they change
  useAutoSave('customers', customers, 500);

  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, ...updatedData } : c
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const getTotalCustomers = () => customers.length;

  const getTotalOrders = () => customers.reduce((sum, c) => sum + c.orders, 0);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getTotalCustomers,
        getTotalOrders,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};
