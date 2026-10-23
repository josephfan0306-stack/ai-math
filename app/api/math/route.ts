import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import {
  anthropic,
  CLAUDE_MODEL,
  claudeErrorResponse,
  MATH_FORMAT_RULES,
  missingKeyResponse,
} from "@/lib/anthropic";
import { findTopic, topicLabel } from "@/lib/curriculum";
import type { Lesson, LessonResponse } from "@/lib/types";

const QUIZ_SIZE = 10;

const LessonSchema = z.object({
  title: z.string().describe("講義標題"),
  objectives: z.array(z.string()).describe("學習目標，3–4 點"),
  content: z.string().describe("講義主體（Markdown），含觀念說明、公式與性質、常見錯誤提醒"),
  examples: z
    .array(z.object({ question: z.string(), solution: z.string() }))
    .describe("例題 3 題，由易到難，solution 需有完整步驟"),
  summary: z.array(z.string()).describe("重點整理，3–6 點"),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).describe("剛好 4 個選項，不要加 (A)(B) 等編號"),
        answerIndex: z.number().int().describe("正確選項的索引，0–3"),
        explanation: z.string().describe("詳解"),
      }),
    )
    .describe(`測驗卷，剛好 ${QUIZ_SIZE} 題單選題`),
});

const SYSTEM_PROMPT = `你是一位經驗豐富的台灣國中數學老師，熟悉 108 課綱與康軒版教材。請針對指定單元，為國中生撰寫一份上課講義與一張測驗卷。
講義要求：
- 只教該單元範圍內的內容，不要超出該年級已學過的知識
- 觀念說明要循序漸進、口吻親切，搭配生活化的例子
- 例題的解題步驟要完整，讓學生能自己看懂
測驗卷要求：
- 剛好 ${QUIZ_SIZE} 題四選一單選題，涵蓋本單元重要觀念，難度由易到難（約基礎 4 題、中等 4 題、進階 2 題）
- 每題只有一個正確答案，請自行驗算確認答案正確，且正確答案的位置要平均分散
- 錯誤選項要對應學生常見的錯誤
${MATH_FORMAT_RULES}`;

export async function POST(request: Request) {
  const keyError = missingKeyResponse();
  if (keyError) return keyError;

  const body = await request.json().catch(() => null);
  const topic = findTopic(body?.grade, body?.semester, body?.chapterNo, body?.sectionNo);
  if (!topic) {
    return Response.json({ error: "請選擇正確的課程單元" }, { status: 400 });
  }

  let response;
  try {
    // 講義加試卷內容較長，用串流避免逾時，finalMessage() 會等全部完成
    response = await anthropic.beta.messages
      .stream({
        model: CLAUDE_MODEL,
        max_tokens: 32000,
        output_config: { effort: "medium", format: betaZodOutputFormat(LessonSchema) },
        // 模型因安全政策拒答時，由伺服器自動改用備援模型重試
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `今天的單元：康軒版 ${topicLabel(topic)}` }],
      })
      .finalMessage();
  } catch (error) {
    return claudeErrorResponse(error);
  }

  if (response.stop_reason === "refusal") {
    return Response.json({ error: "AI 拒絕產生這份講義，請再試一次" }, { status: 502 });
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    return Response.json({ error: "講義內容不完整，請再試一次" }, { status: 502 });
  }

  // 過濾掉格式不正確的題目（選項不是 4 個或答案索引超出範圍）
  const parsed = response.parsed_output;
  const lesson: Lesson = {
    ...parsed,
    quiz: parsed.quiz.filter(
      (q) => q.options.length === 4 && q.answerIndex >= 0 && q.answerIndex < 4,
    ),
  };

  return Response.json({ topic, lesson } satisfies LessonResponse);
}
