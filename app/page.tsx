import Link from "next/link";
import Markdown from "@/components/Markdown";
import { CURRICULUM } from "@/lib/curriculum";

const SECTION_COUNT = CURRICULUM.reduce(
  (sum, v) => sum + v.chapters.reduce((s, c) => s + c.sections.length, 0),
  0,
);

const STATS = [
  { value: "6", unit: "冊", label: "7–9 年級上下學期" },
  { value: String(SECTION_COUNT), unit: "個", label: "可選的課程單元" },
  { value: "10", unit: "題", label: "每單元隨堂測驗" },
  { value: "1", unit: "張照片", label: "就能問老師題目" },
];

const FEATURES = [
  {
    tag: "01",
    title: "一鍵產生上課講義",
    body: "選好年級與單元，AI 老師依康軒版課綱備課：學習目標、觀念說明、由易到難的例題與重點整理，數學式像課本一樣清楚。",
    accent: "bg-marker",
  },
  {
    tag: "02",
    title: "隨堂測驗，立即批改",
    body: "每份講義附 10 題單選測驗卷。交卷馬上算分、標出對錯，每題都有詳解，連錯誤選項是哪種常見錯誤都告訴你。",
    accent: "bg-coral",
  },
  {
    tag: "03",
    title: "拍照問題目",
    body: "作業卡關？拍下題目上傳，AI 老師辨識題目後用國中學過的方法一步一步講解，不只給答案，還告訴你為什麼。",
    accent: "bg-teal",
  },
];

const STEPS = [
  { no: "1", title: "選單元", body: "選年級、學期與今天要上的單元。" },
  { no: "2", title: "讀講義", body: "跟著觀念說明與例題，把重點弄懂。" },
  { no: "3", title: "寫測驗", body: "10 題檢查理解程度，看詳解補強弱點。" },
];

const FAQ = [
  {
    q: "講義內容是依照哪個版本？",
    a: "以康軒版 108 課綱國中數學為主，涵蓋 7 年級到 9 年級上下學期，AI 老師只會教該單元範圍內、該年級學過的內容。",
  },
  {
    q: "AI 給的答案一定正確嗎？",
    a: "AI 老師會自行驗算，但仍可能出錯。建議搭配課本與學校老師的指導，遇到有疑問的地方可以再拍照詢問或請教老師。",
  },
  {
    q: "拍照解題支援哪些題目？",
    a: "國中範圍的數學題目都可以，包含計算題、應用題與幾何圖形題。照片請盡量清楚、完整，一張有多題時可以在補充說明寫要問第幾題。",
  },
  {
    q: "產生一份講義需要多久？",
    a: "講義加測驗卷大約 1–2 分鐘，拍照解題通常在 1 分鐘內完成。",
  },
];

function SectionTitle({ kicker, title, sub }: { kicker: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-coral">{kicker}</span>
      <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{title}</h2>
      {sub && <p className="leading-7 text-ink-soft">{sub}</p>}
    </div>
  );
}

// 首屏右側：一份「講義」的示意卡片
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="absolute -right-3 -top-3 h-full w-full rotate-3 rounded-2xl border border-rule bg-card" aria-hidden />
      <div className="relative flex flex-col gap-4 rounded-2xl border border-rule bg-card p-6 shadow-[8px_8px_0_var(--ink)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-soft">8上・2-3</span>
          <span className="rounded-full bg-marker px-3 py-0.5 text-xs font-bold text-[#1b2a4e]">講義</span>
        </div>
        <h3 className="font-display text-2xl font-black text-ink">畢氏定理</h3>
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 120 100" className="h-24 w-28 shrink-0" aria-label="直角三角形，兩股 3 與 4，斜邊 5">
            <polygon points="15,85 105,85 15,15" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points="15,73 27,73 27,85" fill="none" stroke="var(--coral)" strokeWidth="2" />
            <text x="58" y="98" fontSize="12" fill="var(--ink-soft)" textAnchor="middle">4</text>
            <text x="6" y="54" fontSize="12" fill="var(--ink-soft)">3</text>
            <text x="66" y="45" fontSize="13" fontWeight="700" fill="var(--coral)">5</text>
          </svg>
          <div className="text-lg text-ink">
            <Markdown>{"$$a^2+b^2=c^2$$"}</Markdown>
          </div>
        </div>
        <div className="rounded-xl bg-paper px-4 py-3 text-sm text-ink">
          <Markdown>{"**例題** 兩股 $3$、$4$，斜邊 $\\sqrt{3^2+4^2}=5$"}</Markdown>
        </div>
      </div>

      {/* 測驗分數便利貼 */}
      <div className="absolute -bottom-8 -left-4 flex -rotate-6 flex-col items-center rounded-xl bg-coral px-5 py-3 text-white shadow-lg sm:-left-10">
        <span className="text-xs font-semibold opacity-90">隨堂測驗</span>
        <span className="font-display text-3xl font-black">90 分</span>
      </div>
      {/* 拍照解題對話框 */}
      <div className="absolute -right-2 -top-10 flex rotate-3 items-center gap-2 rounded-full border border-rule bg-card px-4 py-2 text-sm font-medium text-ink shadow-md sm:-right-8">
        📷 <span>這題怎麼解？</span>
        <span className="rounded-full bg-teal px-2 py-0.5 text-xs text-white">5 步驟</span>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    // overflow-x-clip：首屏傾斜的卡片不會在手機上撐出橫向捲軸
    <div className="graph-paper overflow-x-clip text-ink">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div className="flex flex-col items-start gap-7">
          <span className="rounded-full border border-rule bg-card px-4 py-1.5 text-sm text-ink-soft">
            康軒版・108 課綱・國中 7–9 年級
          </span>
          <h1 className="font-display text-4xl font-black leading-[1.25] sm:text-5xl lg:text-6xl">
            數學卡關？
            <br />
            讓 <span className="highlight">AI 家教</span> 陪你
            <br />
            一題一題弄懂。
          </h1>
          <p className="max-w-lg text-lg leading-8 text-ink-soft">
            選好單元，馬上拿到一份為你準備的講義與測驗卷；寫作業遇到不會的題目，拍照問老師就有詳細解說。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tutor"
              className="rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[4px_4px_0_var(--marker)] transition-transform hover:-translate-y-0.5"
            >
              開始上課 →
            </Link>
            <Link
              href="#features"
              className="rounded-full border-2 border-ink px-7 py-3 font-semibold text-ink transition-colors hover:bg-card"
            >
              看看功能
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* 數字 */}
      <section className="border-y border-rule bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-8 text-center">
              <dt className="order-2 text-sm text-ink-soft">{s.label}</dt>
              <dd className="order-1 font-display text-4xl font-black">
                {s.value}
                <span className="ml-1 text-base font-bold text-ink-soft">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 功能 */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <SectionTitle
          kicker="Features"
          title={
            <>
              上課、練習、問問題，<span className="highlight">一個地方</span>就夠
            </>
          }
          sub="把家教老師最重要的三件事，做成隨時都能用的工具。"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.tag}
              className="group flex flex-col gap-4 rounded-2xl border border-rule bg-card p-7 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className={`h-3 w-10 rounded-full ${f.accent}`} />
                <span className="font-mono text-sm text-ink-soft">{f.tag}</span>
              </div>
              <h3 className="font-display text-2xl font-black">{f.title}</h3>
              <p className="leading-7 text-ink-soft">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 使用方式 */}
      <section id="how" className="scroll-mt-20 bg-ink py-24 text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-marker">How it works</span>
            <h2 className="font-display text-3xl font-black sm:text-4xl">三個步驟，完成一堂課</h2>
          </div>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.no} className="relative flex flex-col items-center gap-3 text-center">
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute left-[calc(50%+3rem)] top-8 hidden h-px w-[calc(100%-6rem)] border-t-2 border-dashed border-paper/30 md:block"
                    aria-hidden
                  />
                )}
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-marker font-display text-2xl font-black text-marker">
                  {s.no}
                </span>
                <h3 className="font-display text-xl font-black">{s.title}</h3>
                <p className="max-w-xs leading-7 opacity-75">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-14 text-center opacity-75">
            寫作業卡住了？隨時切到「拍照問題目」，不用等到下次上課。
          </p>
        </div>
      </section>

      {/* 課程單元 */}
      <section id="curriculum" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <SectionTitle
          kicker="Curriculum"
          title="國中三年，六冊都準備好了"
          sub={`依康軒版 108 課綱整理，共 ${SECTION_COUNT} 個單元，選一個就能開始。`}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM.map((v) => (
            <div key={`${v.grade}${v.semester}`} className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl font-black">
                  {v.grade}
                  <span className="text-lg">{v.semester}</span>
                </h3>
                <span className="font-mono text-xs text-ink-soft">{v.grade} 年級{v.semester}學期</span>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {v.chapters.map((c) => (
                  <li key={c.no} className="flex gap-2 border-t border-rule pt-2">
                    <span className="font-mono text-ink-soft">{c.no}</span>
                    <span>{c.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <SectionTitle kicker="FAQ" title="常見問題" />
        <div className="mt-12 flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-rule bg-card px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-xl text-coral transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-7 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl bg-marker px-6 py-16 text-center text-[#1b2a4e] shadow-[8px_8px_0_var(--ink)]">
          <h2 className="font-display text-3xl font-black sm:text-4xl">今天的數學課，現在就開始。</h2>
          <p className="max-w-xl leading-7 opacity-80">不用註冊，選一個單元，一兩分鐘後就有屬於你的講義與測驗卷。</p>
          <Link
            href="/tutor"
            className="rounded-full bg-[#1b2a4e] px-8 py-3.5 font-semibold text-[#fbfaf5] transition-transform hover:-translate-y-0.5"
          >
            開始上課 →
          </Link>
        </div>
      </section>
    </div>
  );
}
