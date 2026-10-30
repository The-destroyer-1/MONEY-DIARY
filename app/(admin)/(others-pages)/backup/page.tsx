'use client';

import React, { useState, useRef } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { useCustomer } from '@/context/CustomerContext';
import { useChat } from '@/context/ChatContext';
import {
  createBackup,
  exportBackupToFile,
  importBackupFromFile,
  getBackupStats,
  getSavedBackups,
  saveBackupToStorage,
  deleteBackupFromStorage,
  clearAllBackups,
  formatFileSize,
  type BackupData,
} from '@/utils/backupUtils';

export default function BackupPage() {
  const { customers } = useCustomer();
  const { messages } = useChat();
  const [backups, setBackups] = useState(getSavedBackups());
  const [backupName, setBackupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      showMessage('Please enter a backup name', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const backup = createBackup(customers, [], messages);
      const saved = saveBackupToStorage(backupName, backup);

      if (saved) {
        setBackups(getSavedBackups());
        setBackupName('');
        showMessage(`Backup "${backupName}" created successfully!`);
      } else {
        showMessage('Failed to save backup', 'error');
      }
    } catch (error) {
      showMessage('Error creating backup', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportBackup = (backup: BackupData, name: string) => {
    try {
      exportBackupToFile(backup, `${name}.json`);
      showMessage('Backup exported successfully!');
    } catch (error) {
      showMessage('Failed to export backup', 'error');
    }
  };

  const handleDeleteBackup = (name: string) => {
    if (confirm(`Delete backup "${name}"?`)) {
      deleteBackupFromStorage(name);
      setBackups(getSavedBackups());
      showMessage('Backup deleted');
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsMerging(true);
    try {
      const backup = await importBackupFromFile(file);
      const autoName = `Imported-${new Date().toISOString().split('T')[0]}`;
      const saved = saveBackupToStorage(autoName, backup);

      if (saved) {
        setBackups(getSavedBackups());
        showMessage(`Backup imported as "${autoName}"`);
      } else {
        showMessage('Failed to save imported backup', 'error');
      }
    } catch (error) {
      showMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsMerging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        'This will delete ALL saved backups. This action cannot be undone. Are you sure?'
      )
    ) {
      clearAllBackups();
      setBackups([]);
      showMessage('All backups cleared');
    }
  };

  const stats = backups.length > 0 ? getBackupStats(backups[backups.length - 1].backup) : null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Backup & Import" />

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup */}
        <ComponentCard title="Create New Backup">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Name
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="e.g., February-2026-Backup"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Data to Backup:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Customers: {customers.length}</li>
                <li>✓ Messages: {messages.length}</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateBackup}
              disabled={isCreating || !backupName.trim()}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Backup'}
            </Button>
          </div>
        </ComponentCard>

        {/* Import Data */}
        <ComponentCard title="Import Backup">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import data from a previously exported JSON backup file.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              disabled={isMerging}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isMerging}
              className="w-full"
            >
              {isMerging ? 'Importing...' : 'Select JSON File to Import'}
            </Button>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-400">
              <p className="font-medium mb-1">How to Import:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select a .json backup file from your computer</li>
                <li>The backup will be imported and saved to your backups</li>
                <li>You can then restore it to your data</li>
              </ol>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Saved Backups */}
      <ComponentCard title="Saved Backups" className="mt-6">
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No backups created yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create your first backup above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((item, index) => {
              const stats = getBackupStats(item.backup);
              const date = new Date(item.backup.timestamp);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {date.toLocaleString()} • {stats.formattedSize}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>Customers: {stats.customersCount}</span>
                      <span>Messages: {stats.messagesCount}</span>
                      <span>Inspections: {stats.inspectionsCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleExportBackup(item.backup, item.name)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                      title="Download as JSON"
                    >
                      ⬇ Export
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(item.name)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                      title="Delete backup"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Backups: {backups.length}
              </p>
              {backups.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </ComponentCard>

      {/* Backup Format Info */}
      <ComponentCard title="Backup Format Information" className="mt-6">
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">JSON Structure:</h4>
            <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-xs">
{`{
  "version": "1.0.0",
  "timestamp": "2026-02-13T10:30:00.000Z",
  "data": {
    "customers": [...],
    "inspections": [...],
    "chatMessages": [...]
  }
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>✓ Save multiple named backups in browser storage</li>
              <li>✓ Export backups as JSON files to download</li>
              <li>✓ Import previously exported backups</li>
              <li>✓ View backup stats (items count, file size)</li>
              <li>✓ Delete individual or all backups</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Note:</h4>
            <p>
              Backups are stored in your browser's localStorage. Clear browser data to remove backups.
              Export backups as JSON files to keep permanent copies on your computer.
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
