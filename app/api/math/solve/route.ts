import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import {
  anthropic,
  CLAUDE_MODEL,
  claudeErrorResponse,
  MATH_FORMAT_RULES,
  missingKeyResponse,
} from "@/lib/anthropic";
import type { Solution } from "@/lib/types";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

// Claude 單張圖片上限 5MB，base64 約為原檔的 4/3
const MAX_BASE64_LENGTH = Math.floor((5 * 1024 * 1024 * 4) / 3);
const MAX_NOTE_LENGTH = 300;

const SolutionSchema = z.object({
  problem: z.string().describe("從照片辨識出的題目原文（Markdown + LaTeX）；看不清楚時說明哪裡無法辨識"),
  concepts: z.array(z.string()).describe("用到的觀念或單元名稱，1–4 個"),
  steps: z
    .array(z.object({ title: z.string(), content: z.string() }))
    .describe("解題步驟，每步一個重點；無法辨識題目時為空陣列"),
  answer: z.string().describe("最終答案；無法辨識題目時說明請使用者重拍"),
  tip: z.string().describe("給學生的學習提醒或類似題要注意的地方"),
});

const SYSTEM_PROMPT = `你是一位親切的台灣國中數學家教。學生會上傳一張數學題目的照片，請：
1. 先完整辨識題目（含圖形中的已知條件）
2. 用國中學過的方法講解（不要用微積分等超出國中範圍的方法），步驟清楚、解釋「為什麼這樣做」
3. 自行驗算確認答案正確
如果照片中有多題，以學生指定的題目為主；沒指定時解第一題。
如果照片不是數學題目或模糊到無法辨識，請在 problem 說明原因，steps 留空。
${MATH_FORMAT_RULES}`;

export async function POST(request: Request) {
  const keyError = missingKeyResponse();
  if (keyError) return keyError;

  const body = await request.json().catch(() => null);
  const image = typeof body?.image === "string" ? body.image : "";
  const mediaType = body?.mediaType as MediaType;
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!image || !MEDIA_TYPES.includes(mediaType)) {
    return Response.json({ error: "請上傳 JPG、PNG、WebP 或 GIF 圖片" }, { status: 400 });
  }
  if (image.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/]+=*$/.test(image)) {
    return Response.json({ error: "圖片太大或格式不正確（上限 5MB）" }, { status: 400 });
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return Response.json({ error: `補充說明請在 ${MAX_NOTE_LENGTH} 字以內` }, { status: 400 });
  }

  let response;
  try {
    response = await anthropic.beta.messages
      .stream({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        output_config: { effort: "medium", format: betaZodOutputFormat(SolutionSchema) },
        // 模型因安全政策拒答時，由伺服器自動改用備援模型重試
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: note ? `學生的問題：${note}` : "請教我這題怎麼解。" },
            ],
          },
        ],
      })
      .finalMessage();
  } catch (error) {
    return claudeErrorResponse(error);
  }

  if (response.stop_reason === "refusal") {
    return Response.json({ error: "AI 無法回答這張圖片，請換一張試試" }, { status: 502 });
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    return Response.json({ error: "解答內容不完整，請再試一次" }, { status: 502 });
  }

  return Response.json(response.parsed_output satisfies Solution);
}
