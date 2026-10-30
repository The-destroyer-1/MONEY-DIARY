"use client";

import React, { useState } from "react";
import { useCustomer, type Customer } from "@/context/CustomerContext";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import ComponentCard from "@/components/common/ComponentCard";

export default function CustomerOrderTable() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomer();
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const handleAddCustomer = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      truckNo: formData.truckNo || "",
      destination: formData.destination || "",
      info: formData.info || "",
      status: (formData.status as "active" | "inactive") || "active",
      orders: formData.orders || 0,
      totalSpent: formData.totalSpent || 0,
      joinDate: formData.joinDate || new Date().toISOString().split("T")[0],
    };

    addCustomer(newCustomer);
    setFormData({});
    closeAddModal();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData(customer);
    openEditModal();
  };

  const handleUpdateCustomer = () => {
    if (editingId) {
      updateCustomer(editingId, formData);
      setEditingId(null);
      setFormData({});
      closeEditModal();
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Customer & Order Management">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-full border border-brand-500 bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 mb-6"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 1.5C5.41 1.5 2.5 4.41 2.5 8C2.5 11.59 5.41 14.5 9 14.5C12.59 14.5 15.5 11.59 15.5 8C15.5 4.41 12.59 1.5 9 1.5ZM13 8.75H9.75V12H8.25V8.75H5V7.25H8.25V4H9.75V7.25H13V8.75Z"
              fill="currentColor"
            />
          </svg>
          Add Customer
        </button>

        <div className="overflow-x-auto">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-500/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-error-500/10 px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {/* Add Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={closeAddModal} className="max-w-[500px] m-4">
        <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-5 text-xl font-semibold text-gray-800 dark:text-white/90">
            Add New Customer
          </h4>

          <div className="space-y-5">
            <div>
              <Label>Full Name *</Label>
              <Input
                type="text"
                placeholder="Enter customer name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                placeholder="Enter phone number"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Truck No</Label>
              <Input
                type="text"
                placeholder="Enter truck number"
                value={formData.truckNo || ""}
                onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
              />
            </div>

            <div>
              <Label>Destination</Label>
              <Input
                type="text"
                placeholder="Enter destination"
                value={formData.destination || ""}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>

            <div>
              <Label>Info</Label>
              <Input
                type="text"
                placeholder="Enter additional info"
                value={formData.info || ""}
                onChange={(e) => setFormData({ ...formData, info: e.target.value })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={formData.status || "active"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label>Orders</Label>
              <Input
                type="number"
                placeholder="Number of orders"
                value={formData.orders || ""}
                onChange={(e) => setFormData({ ...formData, orders: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Total Spent ($)</Label>
              <Input
                type="number"
                placeholder="Total amount spent"
                value={formData.totalSpent || ""}
                onChange={(e) =>
                  setFormData({ ...formData, totalSpent: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex gap-3 justify-end pt-5">
              <Button size="sm" variant="outline" onClick={closeAddModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddCustomer}>
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="max-w-[500px] m-4">
        <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-5 text-xl font-semibold text-gray-800 dark:text-white/90">
            Edit Customer
          </h4>

          <div className="space-y-5">
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="Enter customer name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                placeholder="Enter phone number"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Truck No</Label>
              <Input
                type="text"
                placeholder="Enter truck number"
                value={formData.truckNo || ""}
                onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
              />
            </div>

            <div>
              <Label>Destination</Label>
              <Input
                type="text"
                placeholder="Enter destination"
                value={formData.destination || ""}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>

            <div>
              <Label>Info</Label>
              <Input
                type="text"
                placeholder="Enter additional info"
                value={formData.info || ""}
                onChange={(e) => setFormData({ ...formData, info: e.target.value })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={formData.status || "active"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label>Orders</Label>
              <Input
                type="number"
                placeholder="Number of orders"
                value={formData.orders || ""}
                onChange={(e) => setFormData({ ...formData, orders: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Total Spent ($)</Label>
              <Input
                type="number"
                placeholder="Total amount spent"
                value={formData.totalSpent || ""}
                onChange={(e) =>
                  setFormData({ ...formData, totalSpent: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex gap-3 justify-end pt-5">
              <Button size="sm" variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateCustomer}>
                Update Customer
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
