import React, { useState, useEffect } from "react";
import {
  FaCloudUploadAlt,
  FaWifi,
  FaExclamationTriangle,
} from "react-icons/fa";

/**
 * SyncStatus Component
 * Displays a non-intrusive floating indicator of the connection and sync status.
 */
const SyncStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => setIsSyncing(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sync-started", handleSyncStart);
    window.addEventListener("sync-finished", handleSyncEnd);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync-started", handleSyncStart);
      window.removeEventListener("sync-finished", handleSyncEnd);
    };
  }, []);

  if (isOnline && !isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-subtle">
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md ${
          !isOnline
            ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
            : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
        }`}
      >
        {!isOnline ? (
          <>
            <FaWifi className="animate-pulse" />
            <span className="text-sm font-medium">
              Offline Mode • Actions will sync later
            </span>
          </>
        ) : (
          <>
            <FaCloudUploadAlt className="animate-spin-slow" />
            <span className="text-sm font-medium">Syncing changes...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;
