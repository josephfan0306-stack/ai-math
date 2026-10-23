"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Markdown from "@/components/Markdown";
import {
  addEntry,
  clearHistory,
  getServerSnapshot,
  getSnapshot,
  removeEntry,
  subscribe,
  type HistoryEntry,
} from "@/lib/solve-history";
import type { Solution } from "@/lib/types";

const UPLOAD_MAX_SIDE = 1600;
const THUMB_MAX_SIDE = 240;

const formatTime = (t: number) =>
  new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(t);

// 把照片縮小並轉成 JPEG（手機照片常常好幾 MB），回傳 base64
async function compressImage(file: File, maxSide: number, quality: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // 透明背景補白，避免變黑
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality).split(",")[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

// 列表用的題目摘要：去掉 Markdown 與 LaTeX 符號
function problemExcerpt(problem: string) {
  const text = problem.replace(/\$+|\*\*|#+|\\[a-z]+|[{}]/gi, " ").replace(/\s+/g, " ").trim();
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

function SolutionView({ solution }: { solution: Solution }) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">📄 題目</h2>
        <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <Markdown>{solution.problem}</Markdown>
        </div>
      </div>

      {solution.concepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {solution.concepts.map((c) => (
            <span
              key={c}
              className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700 dark:bg-violet-950 dark:text-violet-300"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {solution.steps.length > 0 && (
        <ol className="flex flex-col gap-4">
          {solution.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-1 font-semibold text-black dark:text-zinc-50">
                  <Markdown inline>{s.title}</Markdown>
                </p>
                <Markdown>{s.content}</Markdown>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-xl bg-emerald-50 px-5 py-4 dark:bg-emerald-950/40">
        <p className="mb-1 font-semibold text-emerald-800 dark:text-emerald-300">✅ 答案</p>
        <Markdown>{solution.answer}</Markdown>
      </div>

      <div className="flex gap-2 text-sm text-zinc-500">
        <span>💡</span>
        <Markdown>{solution.tip}</Markdown>
      </div>
    </article>
  );
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const opened = history.find((h) => h.id === openId);

  const linkButton =
    "text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100";

  // 單筆紀錄的完整解答
  if (opened) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setOpenId(null)} className={linkButton}>
            ← 回到歷史紀錄
          </button>
          {confirmDeleteId === opened.id ? (
            <span className="flex items-center gap-3 text-sm">
              確定刪除這筆？
              <button
                type="button"
                onClick={() => {
                  removeEntry(opened.id);
                  setOpenId(null);
                  setConfirmDeleteId(null);
                }}
                className="font-medium text-rose-600"
              >
                刪除
              </button>
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-zinc-500">
                取消
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmDeleteId(opened.id)} className="text-sm text-zinc-500 hover:text-rose-600">
              刪除這筆
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- 縮圖為 data URL */}
          <img src={opened.thumbnail} alt="題目照片縮圖" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 text-sm text-zinc-600 dark:text-zinc-400">
            <p>提問時間：{formatTime(opened.createdAt)}</p>
            {opened.note && <p className="mt-1">補充說明：{opened.note}</p>}
          </div>
        </div>

        <SolutionView solution={opened.solution} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={linkButton}>
          ← 回到問問題
        </button>
        {history.length > 0 &&
          (confirmClear ? (
            <span className="flex items-center gap-3 text-sm">
              確定清除全部 {history.length} 筆？
              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  setConfirmClear(false);
                }}
                className="font-medium text-rose-600"
              >
                清除
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="text-zinc-500">
                取消
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmClear(true)} className="text-sm text-zinc-500 hover:text-rose-600">
              清除全部
            </button>
          ))}
      </div>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 sm:p-6">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">📚 解題歷史紀錄</h2>
          <span className="text-sm text-zinc-500">共 {history.length} 筆</span>
        </div>

        {history.length === 0 ? (
          <p className="py-10 text-center text-zinc-500">還沒有紀錄，問過的題目會自動存在這裡。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h: HistoryEntry) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(h.id)}
                  className="flex w-full items-center gap-4 rounded-xl border border-zinc-200 p-3 text-left transition-colors hover:border-violet-400 hover:bg-violet-50/50 dark:border-zinc-700 dark:hover:bg-violet-950/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- 縮圖為 data URL */}
                  <img src={h.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-zinc-800 dark:text-zinc-200">{problemExcerpt(h.solution.problem)}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span>{formatTime(h.createdAt)}</span>
                      {h.solution.concepts.slice(0, 2).map((c) => (
                        <span key={c} className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-zinc-400">›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-zinc-400">紀錄只存在這台裝置的瀏覽器中，清除瀏覽器資料後會消失。</p>
    </div>
  );
}

export default function SolvePanel() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [view, setView] = useState<"ask" | "history">("ask");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");

  const [result, setResult] = useState<Solution | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 離開頁面時釋放預覽圖的記憶體
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("請選擇圖片檔");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const [image, thumb] = await Promise.all([
        compressImage(file, UPLOAD_MAX_SIDE, 0.85),
        compressImage(file, THUMB_MAX_SIDE, 0.7),
      ]);
      const res = await fetch("/api/math/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mediaType: "image/jpeg", note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "解題失敗");
      } else {
        setResult(data);
        addEntry({ thumbnail: `data:image/jpeg;base64,${thumb}`, note: note.trim(), solution: data });
      }
    } catch {
      setError("圖片處理或呼叫解題 API 失敗");
    } finally {
      setLoading(false);
    }
  }

  if (view === "history") {
    return <HistoryView onBack={() => setView("ask")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setView("history")}
          className="flex items-center gap-2 rounded-full border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition-colors hover:bg-violet-50 dark:border-violet-800 dark:bg-zinc-900 dark:text-violet-300 dark:hover:bg-violet-950"
        >
          📚 歷史回顧
          {history.length > 0 && (
            <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white">{history.length}</span>
          )}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900"
      >
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500 transition-colors hover:border-violet-400 dark:border-zinc-700">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- 本機預覽的 blob URL 不適用 next/image
            <img src={preview} alt="題目照片預覽" className="max-h-80 w-auto rounded-lg object-contain" />
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <span>點這裡拍照或選擇題目照片</span>
            </>
          )}
          {preview && <span className="text-sm">點圖片可更換照片</span>}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          補充說明（選填）
          <input
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：我想問第 3 題、我卡在第二步"
            className="h-12 rounded-xl border border-zinc-300 bg-transparent px-4 text-base text-black outline-none focus:border-violet-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="h-12 rounded-full bg-violet-600 text-lg font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "老師解題中，約需 30–60 秒…" : "問老師這題怎麼解"}
        </button>

        {error && <p className="text-center text-red-500">{error}</p>}
      </form>

      {result && <SolutionView solution={result} />}
    </div>
  );
}
