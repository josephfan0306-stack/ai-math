"use client";

import { useState } from "react";
import Markdown from "@/components/Markdown";
import type { QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = answers.filter((a, i) => a === questions[i].answerIndex).length;
  const score = Math.round((correctCount / questions.length) * 100);

  function choose(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">📝 隨堂測驗卷</h2>
        <span className="text-sm text-zinc-500">
          共 {questions.length} 題，每題 {Math.round(100 / questions.length)} 分
        </span>
      </div>

      {submitted && (
        <div
          className={`rounded-xl px-5 py-4 text-center ${
            score >= 80
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : score >= 60
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          <p className="text-4xl font-bold tabular-nums">{score} 分</p>
          <p className="mt-1">
            答對 {correctCount} / {questions.length} 題・
            {score >= 80 ? "很棒，你已經掌握這個單元了！" : score >= 60 ? "大致理解，再看看錯的題目詳解吧！" : "建議再複習一次講義，再重新作答。"}
          </p>
        </div>
      )}

      <ol className="flex flex-col gap-6">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const isCorrect = picked === q.answerIndex;
          return (
            <li key={qi} className="flex flex-col gap-3 border-b border-zinc-100 pb-6 last:border-0 dark:border-zinc-800">
              <div className="flex gap-2 text-black dark:text-zinc-50">
                <span className="shrink-0 font-semibold">{qi + 1}.</span>
                {submitted && <span className="shrink-0">{isCorrect ? "✅" : "❌"}</span>}
                <Markdown>{q.question}</Markdown>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const selected = picked === oi;
                  let style = "border-zinc-200 hover:border-sky-400 dark:border-zinc-700";
                  if (submitted && oi === q.answerIndex) {
                    style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
                  } else if (submitted && selected) {
                    style = "border-rose-500 bg-rose-50 dark:bg-rose-950";
                  } else if (selected) {
                    style = "border-sky-500 bg-sky-50 dark:bg-sky-950";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => choose(qi, oi)}
                      disabled={submitted}
                      className={`flex items-start gap-2 rounded-xl border-2 px-4 py-3 text-left text-zinc-800 transition-colors disabled:cursor-default dark:text-zinc-200 ${style}`}
                    >
                      <span className="shrink-0 font-semibold">({LETTERS[oi]})</span>
                      <Markdown inline>{opt}</Markdown>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="rounded-xl bg-zinc-50 px-4 py-3 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <p className="mb-1 font-semibold">
                    正確答案：({LETTERS[q.answerIndex]})
                    {picked === null && <span className="ml-2 font-normal text-zinc-500">（未作答）</span>}
                  </p>
                  <Markdown>{q.explanation}</Markdown>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {submitted ? (
        <button
          type="button"
          onClick={retry}
          className="h-12 rounded-full border-2 border-sky-600 font-medium text-sky-700 transition-colors hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
        >
          重新作答
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={answeredCount === 0}
          className="h-12 rounded-full bg-sky-600 font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
        >
          交卷（已作答 {answeredCount} / {questions.length} 題）
        </button>
      )}
    </section>
  );
}
