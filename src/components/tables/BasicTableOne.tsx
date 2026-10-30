"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { useAutoSave, loadFromLocalStorage } from "@/hooks/useAutoSave";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface InspectionRecord {
  id: number;
  no: string;
  truckNo: string;
  date: string;
  trailer: string;
  trailerDate: string;
  insp: string;
  inspDate: string;
  sgDate: string;
  provider: string;
  sg: string;
  inspectionDate: string;
  approved: "Yes" | "No" | "Pending";
  remarks: string;
}

// Define the table data using the interface
const tableData: InspectionRecord[] = [];


export default function BasicTableOne() {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<InspectionRecord>>({});
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();

  // Load records from localStorage on mount
  useEffect(() => {
    const savedRecords = loadFromLocalStorage<InspectionRecord[]>(
      'inspectionRecords',
      tableData
    );
    setRecords(savedRecords);
    setIsInitialized(true);
  }, []);

  // Auto-save records to localStorage whenever they change
  useAutoSave('inspectionRecords', records, 500);

  const handleAddInspection = () => {
    if (!formData.no || !formData.truckNo) {
      alert("Please fill in all required fields");
      return;
    }

    const newRecord: InspectionRecord = {
      id: Math.max(...records.map((r) => r.id), 0) + 1,
      no: formData.no || "",
      truckNo: formData.truckNo || "",
      date: formData.date || "",
      trailer: formData.trailer || "",
      trailerDate: formData.trailerDate || "",
      insp: formData.insp || "",
      inspDate: formData.inspDate || "",
      sgDate: formData.sgDate || "",
      provider: formData.provider || "",
      sg: formData.sg || "",
      inspectionDate: formData.inspectionDate || "",
      approved: (formData.approved as "Yes" | "No" | "Pending") || "Pending",
      remarks: formData.remarks || "",
    };

    setRecords([...records, newRecord]);
    setFormData({});
    closeAddModal();
  };

  const handleEditRecord = (record: InspectionRecord) => {
    setEditingId(record.id);
    setFormData(record);
    openEditModal();
  };

  const handleUpdateRecord = () => {
    if (editingId) {
      setRecords(records.map((r) => (r.id === editingId ? { ...r, ...formData } : r)));
      setEditingId(null);
      setFormData({});
      closeEditModal();
    }
  };

  const handleDeleteRecord = (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Add Button */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-full border border-brand-500 bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
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
          Add Inspection
        </button>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-full">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Truck No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Trailer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Trailer Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Insp
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Insp Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      S/G Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Provider
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      S/G
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Inspection Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Approved
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Remarks
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-300 text-start text-theme-sm">
                        {record.no}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-300 text-start text-theme-sm font-medium">
                        {record.truckNo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.date}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.trailer}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.trailerDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.insp}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.inspDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.sgDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.provider}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.sg}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.inspectionDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <Badge
                          size="sm"
                          color={
                            record.approved === "Yes"
                              ? "success"
                              : record.approved === "No"
                              ? "error"
                              : "warning"
                          }
                        >
                          {record.approved}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.remarks}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-500/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-error-500/10 px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Inspection Modal */}
      <Modal isOpen={isAddOpen} onClose={closeAddModal} className="max-w-2xl">
        <div className="relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-5 text-xl font-semibold text-gray-800 dark:text-white/90">
            Add New Inspection
          </h4>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>No *</Label>
              <Input
                type="text"
                placeholder="Inspection number"
                value={formData.no || ""}
                onChange={(e) => setFormData({ ...formData, no: e.target.value })}
              />
            </div>

            <div>
              <Label>Truck No *</Label>
              <Input
                type="text"
                placeholder="Truck number"
                value={formData.truckNo || ""}
                onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Trailer</Label>
              <Input
                type="text"
                placeholder="Trailer number"
                value={formData.trailer || ""}
                onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
              />
            </div>

            <div>
              <Label>Trailer Date</Label>
              <Input
                type="date"
                value={formData.trailerDate || ""}
                onChange={(e) => setFormData({ ...formData, trailerDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Insp</Label>
              <Input
                type="text"
                placeholder="Inspection ID"
                value={formData.insp || ""}
                onChange={(e) => setFormData({ ...formData, insp: e.target.value })}
              />
            </div>

            <div>
              <Label>Insp Date</Label>
              <Input
                type="date"
                value={formData.inspDate || ""}
                onChange={(e) => setFormData({ ...formData, inspDate: e.target.value })}
              />
            </div>

            <div>
              <Label>S/G Date</Label>
              <Input
                type="date"
                value={formData.sgDate || ""}
                onChange={(e) => setFormData({ ...formData, sgDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Provider</Label>
              <Input
                type="text"
                placeholder="Provider name"
                value={formData.provider || ""}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div>
              <Label>S/G</Label>
              <Input
                type="text"
                placeholder="S/G ID"
                value={formData.sg || ""}
                onChange={(e) => setFormData({ ...formData, sg: e.target.value })}
              />
            </div>

            <div>
              <Label>Inspection Date</Label>
              <Input
                type="date"
                value={formData.inspectionDate || ""}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Approved</Label>
              <select
                value={formData.approved || "Pending"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    approved: e.target.value as "Yes" | "No" | "Pending",
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label>Remarks</Label>
              <textarea
                placeholder="Additional remarks"
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-5">
            <Button size="sm" variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddInspection}>
              Add Inspection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Inspection Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="max-w-2xl">
        <div className="relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-5 text-xl font-semibold text-gray-800 dark:text-white/90">
            Edit Inspection
          </h4>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>No</Label>
              <Input
                type="text"
                placeholder="Inspection number"
                value={formData.no || ""}
                onChange={(e) => setFormData({ ...formData, no: e.target.value })}
              />
            </div>

            <div>
              <Label>Truck No</Label>
              <Input
                type="text"
                placeholder="Truck number"
                value={formData.truckNo || ""}
                onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Trailer</Label>
              <Input
                type="text"
                placeholder="Trailer number"
                value={formData.trailer || ""}
                onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
              />
            </div>

            <div>
              <Label>Trailer Date</Label>
              <Input
                type="date"
                value={formData.trailerDate || ""}
                onChange={(e) => setFormData({ ...formData, trailerDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Insp</Label>
              <Input
                type="text"
                placeholder="Inspection ID"
                value={formData.insp || ""}
                onChange={(e) => setFormData({ ...formData, insp: e.target.value })}
              />
            </div>

            <div>
              <Label>Insp Date</Label>
              <Input
                type="date"
                value={formData.inspDate || ""}
                onChange={(e) => setFormData({ ...formData, inspDate: e.target.value })}
              />
            </div>

            <div>
              <Label>S/G Date</Label>
              <Input
                type="date"
                value={formData.sgDate || ""}
                onChange={(e) => setFormData({ ...formData, sgDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Provider</Label>
              <Input
                type="text"
                placeholder="Provider name"
                value={formData.provider || ""}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div>
              <Label>S/G</Label>
              <Input
                type="text"
                placeholder="S/G ID"
                value={formData.sg || ""}
                onChange={(e) => setFormData({ ...formData, sg: e.target.value })}
              />
            </div>

            <div>
              <Label>Inspection Date</Label>
              <Input
                type="date"
                value={formData.inspectionDate || ""}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Approved</Label>
              <select
                value={formData.approved || "Pending"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    approved: e.target.value as "Yes" | "No" | "Pending",
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label>Remarks</Label>
              <textarea
                placeholder="Additional remarks"
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-5">
            <Button size="sm" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateRecord}>
              Update Inspection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
