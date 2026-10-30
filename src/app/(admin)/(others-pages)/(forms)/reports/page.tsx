"use client";

import React, { useState, useRef } from "react";
import { useCustomer } from "@/context/CustomerContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function ReportPage() {
  const { customers } = useCustomer();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const reportRef = useRef<HTMLDivElement>(null);

  // Filter customers based on date range
  const filteredCustomers = customers.filter((customer) => {
    if (!fromDate && !toDate) return true;

    const joinDate = new Date(customer.joinDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && joinDate < from) return false;
    if (to && joinDate > to) return false;

    return true;
  });

  const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.orders, 0);
  const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer & Order Report - RATL</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  color: #333;
                }
                h1 {
                  text-align: center;
                  color: #1f2937;
                  margin-bottom: 10px;
                }
                .report-meta {
                  text-align: center;
                  margin-bottom: 20px;
                  font-size: 14px;
                  color: #666;
                }
                .summary {
                  display: flex;
                  gap: 20px;
                  margin-bottom: 30px;
                  justify-content: center;
                }
                .summary-card {
                  text-align: center;
                  padding: 15px 30px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .summary-card h3 {
                  margin: 0 0 10px 0;
                  font-size: 14px;
                  color: #666;
                }
                .summary-card .value {
                  font-size: 24px;
                  font-weight: bold;
                  color: #1f2937;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th {
                  background-color: #f3f4f6;
                  border: 1px solid #ddd;
                  padding: 12px;
                  text-align: left;
                  font-weight: 600;
                  color: #1f2937;
                }
                td {
                  border: 1px solid #ddd;
                  padding: 10px;
                  color: #666;
                }
                tr:nth-child(even) {
                  background-color: #f9fafb;
                }
                .status-active {
                  color: #16a34a;
                  font-weight: 500;
                }
                .status-inactive {
                  color: #dc2626;
                  font-weight: 500;
                }
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  border-top: 1px solid #ddd;
                  padding-top: 20px;
                }
              </style>
            </head>
            <body>
              <h1>Customer & Order Report</h1>
              <div class="report-meta">
                <p>RATL Administration Dashboard</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                ${fromDate || toDate ? `<p>Report Period: ${fromDate || "Start"} to ${toDate || "End"}</p>` : ""}
              </div>

              <div class="summary">
                <div class="summary-card">
                  <h3>Total Customers</h3>
                  <div class="value">${filteredCustomers.length}</div>
                </div>
                <div class="summary-card">
                  <h3>Total Orders</h3>
                  <div class="value">${totalOrders}</div>
                </div>
                <div class="summary-card">
                  <h3>Total Revenue</h3>
                  <div class="value">$${totalSpent.toLocaleString()}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Truck No</th>
                    <th>Destination</th>
                    <th>Info</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredCustomers
                    .map(
                      (customer) => `
                    <tr>
                      <td>${customer.name}</td>
                      <td>${customer.email}</td>
                      <td>${customer.phone}</td>
                      <td>${customer.truckNo}</td>
                      <td>${customer.destination}</td>
                      <td>${customer.info}</td>
                      <td><span class="status-${customer.status}">${customer.status}</span></td>
                      <td>${customer.orders}</td>
                      <td>$${customer.totalSpent}</td>
                      <td>${customer.joinDate}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div class="footer">
                <p>This is an official report from RATL Administration Dashboard</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Customer & Order Report" />

      <ComponentCard title="Report">
        <div className="space-y-6">
          {/* Date Filter Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Filter by Date Range
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Select start date"
                />
              </div>

              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Select end date"
                />
              </div>

              <div className="flex items-end gap-3">
                <Button onClick={handleReset} variant="outline">
                  Clear Filters
                </Button>
                <Button onClick={handlePrint}>
                  Print Report
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {filteredCustomers.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Report Table */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Customer Details
            </h3>

            <div className="overflow-x-auto" ref={reportRef}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Truck No
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Info
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Total Spent
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white/90">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.email}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.phone}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.truckNo}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.destination}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.info}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              customer.status === "active"
                                ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.orders}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white/90">
                          ${customer.totalSpent}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-400">
                          {customer.joinDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-6 text-center text-gray-600 dark:text-gray-400"
                      >
                        No customers found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
