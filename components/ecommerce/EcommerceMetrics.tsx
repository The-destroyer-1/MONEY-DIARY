"use client";
import React from "react";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useCustomer } from "@/context/CustomerContext";

export const EcommerceMetrics = () => {
  const { getTotalCustomers, getTotalOrders } = useCustomer();
  const totalCustomers = getTotalCustomers();
  const totalOrders = getTotalOrders();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Customers Card Start --> */}
      <Link href="/form-elements">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-400 transition-all cursor-pointer">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Customers
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalCustomers.toLocaleString()}
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              {totalCustomers > 0 ? `${totalCustomers}` : '0'}
            </Badge>
          </div>
        </div>
      </Link>
      {/* <!-- Customers Card End --> */}

      {/* <!-- Orders Card Start --> */}
      <Link href="/form-elements">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-400 transition-all cursor-pointer">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orders
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalOrders.toLocaleString()}
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon className="text-error-500" />
              {totalOrders > 0 ? `${totalOrders}` : '0'}
            </Badge>
          </div>
        </div>
      </Link>
      {/* <!-- Orders Card End --> */}
    </div>
  );
};
