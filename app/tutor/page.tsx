"use client";

import { useState } from "react";
import LessonPanel from "@/components/LessonPanel";
import SolvePanel from "@/components/SolvePanel";

const TABS = [
  { id: "lesson", label: "📘 課程學習" },
  { id: "solve", label: "📷 拍照問題目" },
] as const;

export default function TutorPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("lesson");

  return (
    <div className="graph-paper flex flex-1 flex-col items-center px-4 py-10 font-sans">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <header className="text-center">
          <h1 className="font-display text-3xl font-black text-ink">今天想學什麼？</h1>
          <p className="mt-2 text-ink-soft">選單元產生講義與測驗，或拍照問老師題目</p>
        </header>

        <nav className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`h-11 flex-1 rounded-xl font-medium transition-colors ${
                tab === t.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* 兩個分頁都保持掛載，切換時不會遺失講義或解答 */}
        <div hidden={tab !== "lesson"}>
          <LessonPanel />
        </div>
        <div hidden={tab !== "solve"}>
          <SolvePanel />
        </div>
      </div>
    </div>
  );
}
