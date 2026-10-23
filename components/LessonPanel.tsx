"use client";

import { useState } from "react";
import Markdown from "@/components/Markdown";
import Quiz from "@/components/Quiz";
import { CURRICULUM, topicLabel, type Semester } from "@/lib/curriculum";
import type { LessonResponse } from "@/lib/types";

const GRADES = [7, 8, 9] as const;
const SEMESTERS: Semester[] = ["上", "下"];

export default function LessonPanel() {
  const [grade, setGrade] = useState<7 | 8 | 9>(7);
  const [semester, setSemester] = useState<Semester>("上");
  const [selected, setSelected] = useState<{ chapterNo: number; sectionNo: number } | null>(null);

  const [result, setResult] = useState<LessonResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const volume = CURRICULUM.find((v) => v.grade === grade && v.semester === semester)!;

  function changeVolume(g: 7 | 8 | 9, s: Semester) {
    setGrade(g);
    setSemester(s);
    setSelected(null);
  }

  async function generate() {
    if (!selected) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, semester, ...selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "產生講義失敗");
      } else {
        setResult(data);
      }
    } catch {
      setError("呼叫 /api/math 失敗");
    } finally {
      setLoading(false);
    }
  }

  const tabClass = (active: boolean) =>
    `h-11 flex-1 rounded-xl font-medium transition-colors ${
      active
        ? "bg-sky-600 text-white"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    }`;

  const lesson = result?.lesson;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500">年級</p>
          <div className="flex gap-2">
            {GRADES.map((g) => (
              <button key={g} type="button" onClick={() => changeVolume(g, semester)} className={tabClass(grade === g)}>
                {g} 年級
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500">學期</p>
          <div className="flex gap-2">
            {SEMESTERS.map((s) => (
              <button key={s} type="button" onClick={() => changeVolume(grade, s)} className={tabClass(semester === s)}>
                {s}學期
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-500">今天要上的單元（康軒版 {grade}{semester}）</p>
          {volume.chapters.map((ch) => (
            <div key={ch.no} className="flex flex-col gap-2">
              <p className="font-semibold text-black dark:text-zinc-50">
                第 {ch.no} 章　{ch.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {ch.sections.map((title, i) => {
                  const active = selected?.chapterNo === ch.no && selected.sectionNo === i + 1;
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setSelected({ chapterNo: ch.no, sectionNo: i + 1 })}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        active
                          ? "border-sky-600 bg-sky-600 text-white"
                          : "border-zinc-300 text-zinc-700 hover:border-sky-500 dark:border-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {ch.no}-{i + 1} {title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={!selected || loading}
          className="h-12 rounded-full bg-sky-600 text-lg font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? "老師備課中，約需 1–2 分鐘…" : selected ? "開始上課：產生講義與測驗卷" : "請先選擇單元"}
        </button>

        {error && <p className="text-center text-red-500">{error}</p>}
      </section>

      {result && lesson && (
        <>
          <article className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <header className="flex flex-col gap-1 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <p className="text-sm text-sky-600 dark:text-sky-400">康軒版 {topicLabel(result.topic)}</p>
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50">📘 {lesson.title}</h2>
            </header>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">🎯 學習目標</h3>
              <ul className="list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
                {lesson.objectives.map((o) => (
                  <li key={o}>
                    <Markdown inline>{o}</Markdown>
                  </li>
                ))}
              </ul>
            </div>

            <Markdown>{lesson.content}</Markdown>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50">✏️ 例題</h3>
              {lesson.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="mb-2 font-semibold text-sky-700 dark:text-sky-400">例題 {i + 1}</p>
                  <Markdown>{ex.question}</Markdown>
                  <details className="mt-3 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                    <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                      看解答
                    </summary>
                    <div className="mt-2">
                      <Markdown>{ex.solution}</Markdown>
                    </div>
                  </details>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-amber-50 p-5 dark:bg-amber-950/40">
              <h3 className="mb-2 text-lg font-semibold text-amber-800 dark:text-amber-300">⭐ 重點整理</h3>
              <ul className="list-disc space-y-1 pl-6 text-zinc-800 dark:text-zinc-200">
                {lesson.summary.map((s) => (
                  <li key={s}>
                    <Markdown inline>{s}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {lesson.quiz.length > 0 && (
            // key 讓換單元時測驗狀態重置
            <Quiz key={topicLabel(result.topic) + lesson.title} questions={lesson.quiz} />
          )}
        </>
      )}
    </div>
  );
}
