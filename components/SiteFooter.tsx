import Link from "next/link";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/tutor", label: "開始上課" },
      { href: "/#features", label: "功能介紹" },
      { href: "/#curriculum", label: "課程單元" },
    ],
  },
  {
    title: "說明",
    links: [
      { href: "/#how", label: "使用方式" },
      { href: "/#faq", label: "常見問題" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-sm text-sm leading-7 text-ink-soft">
            依康軒版 108 課綱設計的 AI 國中數學家教。講義、測驗卷、拍照解題，一個地方就夠。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink">{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-soft sm:flex-row sm:justify-between sm:px-6">
          <p>© 2026 AI 數學家教</p>
          <p>內容由 AI 生成，可能有錯誤，請搭配課本與老師指導。「康軒」為其所有者之商標，本服務與其無關聯。</p>
        </div>
      </div>
    </footer>
  );
}
