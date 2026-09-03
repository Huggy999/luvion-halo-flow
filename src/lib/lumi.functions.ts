import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const inputSchema = z.object({ question: z.string().min(1).max(600) });

export const askLumi = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    const apiKey = process.env["LOVABLE_API_KEY"];

    if (!url || !key) {
      return { text: "База недоступна. Обновите страницу и повторите вопрос." };
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [{ data: hubs }, { data: tasks }] = await Promise.all([
      supabase.from("hubs").select("id,name,description").order("position"),
      supabase
        .from("tasks")
        .select("title,hub_id,priority,board_column,is_today,is_done")
        .order("created_at"),
    ]);

    const hubName = (id: string | null) =>
      hubs?.find((h) => h.id === id)?.name ?? "без хаба";

    const context = [
      `Хабы: ${(hubs ?? []).map((h) => `${h.name} (${h.description || "без описания"})`).join("; ") || "нет"}`,
      `Задачи:`,
      ...(tasks ?? []).map(
        (t) =>
          `- ${t.title} | хаб: ${hubName(t.hub_id)} | приоритет: ${t.priority} | колонка: ${t.board_column} | на сегодня: ${t.is_today ? "да" : "нет"} | выполнена: ${t.is_done ? "да" : "нет"}`,
      ),
    ].join("\n");

    if (!apiKey) {
      return {
        text: "Ключ доступа к модели не настроен. Добавьте его в настройках проекта, чтобы Луми отвечал.",
      };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "Ты Луми, помощник приложения Luvion. Отвечай по-русски, спокойно и коротко, без эмодзи и восклицательных знаков. Используй только данные пользователя ниже, ничего не выдумывай. Если данных нет, скажи об этом прямо и предложи следующий шаг.\n\n" +
              context,
          },
          { role: "user", content: data.question },
        ],
      }),
    });

    if (res.status === 429) {
      return { text: "Лимит запросов исчерпан. Попробуйте позже." };
    }
    if (!res.ok) {
      return {
        text: `Ответ не получен, код ${res.status}. Повторите вопрос через минуту.`,
      };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      text: json.choices?.[0]?.message?.content ?? "Ответ пустой. Повторите вопрос.",
    };
  });
