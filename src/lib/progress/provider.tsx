"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getDefaultProgressStore,
  type LessonStatus,
  type ProgressStore,
} from "@/lib/progress/store";

const ProgressContext = createContext<ProgressStore | null>(null);

export function ProgressProvider({
  children,
  store,
}: {
  children: ReactNode;
  store?: ProgressStore;
}) {
  const value = store ?? getDefaultProgressStore();
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressStore(): ProgressStore {
  const store = useContext(ProgressContext);
  if (!store) {
    throw new Error("useProgressStore must be used within a ProgressProvider");
  }
  return store;
}

export function useProgress() {
  const store = useProgressStore();
  const progress = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return {
    progress,
    getStatus: (key: string): LessonStatus => progress[key]?.status ?? "not-started",
    setStatus: store.setStatus,
    clear: store.clear,
  };
}
