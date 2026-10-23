import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// 顯示 AI 回傳的 Markdown + LaTeX 數學式；inline 用在選項等單行文字
export default function Markdown({ children, inline = false }: { children: string; inline?: boolean }) {
  return (
    <div className={inline ? "markdown markdown-inline" : "markdown"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={inline ? { p: ({ children }) => <span>{children}</span> } : undefined}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
