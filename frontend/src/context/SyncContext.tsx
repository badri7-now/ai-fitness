import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { Workout } from "../types";

export type SyncStatus = "synced" | "syncing" | "offline";

interface SyncContextType {
  status: SyncStatus;
  pendingCount: number;
  queueOfflineWorkout: (workout: Workout) => Promise<void>;
  syncNow: () => Promise<{ success: boolean; synced: number }>;
}

const SyncContext = createContext<SyncContextType>({
  status: "synced",
  pendingCount: 0,
  queueOfflineWorkout: async () => {},
  syncNow: async () => ({ success: true, synced: 0 })
});

const OFFLINE_QUEUE_KEY = "@offline_workout_queue";

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SyncStatus>("synced");
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadPendingQueue = async (): Promise<Workout[]> => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const savePendingQueue = async (queue: Workout[]) => {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  };

  const queueOfflineWorkout = async (workout: Workout) => {
    const current = await loadPendingQueue();
    // Ensure offline flag
    const offlineItem: Workout = { ...workout, isOffline: true };
    const updated = [...current, offlineItem];
    await savePendingQueue(updated);
    setStatus("offline");
    // Attempt background sync
    syncNow();
  };

  const syncNow = async (): Promise<{ success: boolean; synced: number }> => {
    const queue = await loadPendingQueue();
    if (queue.length === 0) {
      setStatus("synced");
      return { success: true, synced: 0 };
    }

    setStatus("syncing");
    try {
      const res = await api.post("/workouts/sync", { workouts: queue });
      if (res.success) {
        await savePendingQueue([]);
        setStatus("synced");
        return { success: true, synced: res.syncedCount || queue.length };
      } else {
        setStatus("offline");
        return { success: false, synced: 0 };
      }
    } catch (e) {
      setStatus("offline");
      return { success: false, synced: 0 };
    }
  };

  useEffect(() => {
    loadPendingQueue().then((q) => {
      setPendingCount(q.length);
      if (q.length > 0) {
        syncNow();
      }
    });

    // Heartbeat check every 30 seconds
    const interval = setInterval(() => {
      loadPendingQueue().then((q) => {
        if (q.length > 0) syncNow();
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SyncContext.Provider value={{ status, pendingCount, queueOfflineWorkout, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
