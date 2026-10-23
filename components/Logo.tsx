import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink">
      <span className="flex h-9 w-9 -rotate-6 items-center justify-center rounded-lg bg-ink font-display text-xl font-black text-paper shadow-[3px_3px_0_var(--marker)]">
        ∑
      </span>
      <span className="font-display text-lg font-black tracking-wide">AI 數學家教</span>
    </Link>
  );
}
