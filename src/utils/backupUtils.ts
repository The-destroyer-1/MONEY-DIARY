// Backup and Import utilities for dashboard data

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    customers: any[];
    inspections: any[];
    chatMessages: any[];
  };
}

/**
 * Create a backup of all dashboard data
 */
export const createBackup = (
  customers: any[],
  inspections: any[],
  chatMessages: any[]
): BackupData => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data: {
      customers,
      inspections,
      chatMessages,
    },
  };
};

/**
 * Export backup as JSON file
 */
export const exportBackupToFile = (backup: BackupData, filename?: string) => {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ratl-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import backup from JSON file
 */
export const importBackupFromFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content) as BackupData;
        
        // Validate backup structure
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format');
        }
        
        resolve(backup);
      } catch (error) {
        reject(new Error(`Failed to parse backup file: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Generate backup statistics
 */
export const getBackupStats = (backup: BackupData) => {
  return {
    customersCount: backup.data.customers.length,
    inspectionsCount: backup.data.inspections.length,
    messagesCount: backup.data.chatMessages.length,
    totalSize: JSON.stringify(backup).length,
    formattedSize: formatFileSize(JSON.stringify(backup).length),
  };
};

/**
 * Format bytes to human readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get all backups from localStorage
 */
export const getSavedBackups = (): { name: string; backup: BackupData }[] => {
  try {
    const saved = localStorage.getItem('ratl_backups');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to get saved backups:', error);
    return [];
  }
};

/**
 * Save backup to localStorage
 */
export const saveBackupToStorage = (name: string, backup: BackupData) => {
  try {
    const backups = getSavedBackups();
    const exists = backups.findIndex((b) => b.name === name);
    if (exists >= 0) {
      backups[exists] = { name, backup };
    } else {
      backups.push({ name, backup });
    }
    localStorage.setItem('ratl_backups', JSON.stringify(backups));
    return true;
  } catch (error) {
    console.error('Failed to save backup:', error);
    return false;
  }
};

/**
 * Delete backup from localStorage
 */
export const deleteBackupFromStorage = (name: string) => {
  try {
    const backups = getSavedBackups();
    const filtered = backups.filter((b) => b.name !== name);
    localStorage.setItem('ratl_backups', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return false;
  }
};

/**
 * Clear all backups from localStorage
 */
export const clearAllBackups = () => {
  try {
    localStorage.removeItem('ratl_backups');
    return true;
  } catch (error) {
    console.error('Failed to clear backups:', error);
    return false;
  }
};
