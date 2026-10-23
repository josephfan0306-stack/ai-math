import type { Solution } from "./types";

// 拍照解題的歷史紀錄，存在使用者瀏覽器的 localStorage（只在同一台裝置、同一個瀏覽器看得到）
export type HistoryEntry = {
  id: string;
  createdAt: number;
  thumbnail: string; // 縮圖的 data URL
  note: string;
  solution: Solution;
};

const STORAGE_KEY = "ai-math:solve-history";
const MAX_ENTRIES = 50;
const EMPTY: HistoryEntry[] = [];

const listeners = new Set<() => void>();
let cache: HistoryEntry[] | null = null;

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  // localStorage 容量有限（約 5MB），存不下時從最舊的開始刪
  let list = entries.slice(0, MAX_ENTRIES);
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      break;
    } catch {
      list = list.slice(0, -1);
    }
  }
  cache = list;
  listeners.forEach((l) => l());
}

// 給 useSyncExternalStore 用
export function subscribe(listener: () => void) {
  listeners.add(listener);
  // 其他分頁修改紀錄時同步更新
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot() {
  cache ??= read();
  return cache;
}

export function getServerSnapshot() {
  return EMPTY;
}

export function addEntry(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  const full: HistoryEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
  write([full, ...getSnapshot()]);
  return full;
}

export function removeEntry(id: string) {
  write(getSnapshot().filter((e) => e.id !== id));
}

export function clearHistory() {
  write([]);
}
