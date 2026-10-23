"use client";

import { useEffect, useState } from "react";
import Markdown from "@/components/Markdown";
import type { Solution } from "@/lib/types";

const MAX_SIDE = 1600;

// 把照片縮小並轉成 JPEG（手機照片常常好幾 MB），回傳 base64
async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // 透明背景補白，避免變黑
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function SolvePanel() {
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
      const image = await compressImage(file);
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
      }
    } catch {
      setError("圖片處理或呼叫解題 API 失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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

      {result && (
        <article className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">📄 題目</h2>
            <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
              <Markdown>{result.problem}</Markdown>
            </div>
          </div>

          {result.concepts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.concepts.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {result.steps.length > 0 && (
            <ol className="flex flex-col gap-4">
              {result.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 font-semibold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 font-semibold text-black dark:text-zinc-50">{s.title}</p>
                    <Markdown>{s.content}</Markdown>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="rounded-xl bg-emerald-50 px-5 py-4 dark:bg-emerald-950/40">
            <p className="mb-1 font-semibold text-emerald-800 dark:text-emerald-300">✅ 答案</p>
            <Markdown>{result.answer}</Markdown>
          </div>

          <p className="text-sm text-zinc-500">💡 {result.tip}</p>
        </article>
      )}
    </div>
  );
}
