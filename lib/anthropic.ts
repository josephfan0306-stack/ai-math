import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

// 自動讀取環境變數 ANTHROPIC_API_KEY；
// 若 Key 沒有綁定 workspace，需另外設定 ANTHROPIC_WORKSPACE_ID
const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
export const anthropic = new Anthropic(
  workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {},
);

// 數學內容的共同格式規範
export const MATH_FORMAT_RULES = `格式規範：
- 全部使用繁體中文與台灣慣用的數學用語（例如「平方根」「坐標」「聯立方程式」）
- 內文使用 Markdown；數學式一律用 LaTeX：行內用 $...$，獨立一行用 $$...$$
- 不要使用 HTML 標籤`;

export function missingKeyResponse() {
  if (process.env.ANTHROPIC_API_KEY) return null;
  return Response.json({ error: "伺服器尚未設定 ANTHROPIC_API_KEY" }, { status: 500 });
}

// 把 Claude API 的錯誤轉成給前端看的中文訊息
export function claudeErrorResponse(error: unknown) {
  console.error("Claude API error:", error);
  if (error instanceof Anthropic.AuthenticationError) {
    return Response.json({ error: "Claude API Key 無效" }, { status: 500 });
  }
  if (error instanceof Anthropic.RateLimitError) {
    return Response.json({ error: "請求太頻繁，請稍後再試" }, { status: 429 });
  }
  if (error instanceof Anthropic.APIError) {
    return Response.json({ error: `Claude API 錯誤：${error.message}` }, { status: 502 });
  }
  return Response.json({ error: "無法連線到 Claude API" }, { status: 502 });
}
