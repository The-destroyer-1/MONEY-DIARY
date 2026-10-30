import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomerOrderTable from "@/components/form/CustomerOrderTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Form Elements | RATL - Dashboard Template",
  description:
    "This is Next.js Form Elements page for RATL Dashboard Template",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="space-y-6">
        <CustomerOrderTable />
      </div>
    </div>
  );
}
