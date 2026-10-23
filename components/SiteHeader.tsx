import Link from "next/link";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/#features", label: "功能" },
  { href: "/#how", label: "使用方式" },
  { href: "/#curriculum", label: "課程單元" },
  { href: "/#faq", label: "常見問題" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/tutor"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
        >
          開始上課
        </Link>
      </div>
    </header>
  );
}
