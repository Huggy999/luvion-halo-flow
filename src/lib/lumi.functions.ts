import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ question: z.string().min(1).max(600) });

export const askLumi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { consumeAiCall } = await import("@/lib/billing.server");
    const email = (context.claims["email"] as string | undefined) ?? "";

    // Счётчик запросов увеличивается на сервере, клиент на него не влияет.
    const quota = await consumeAiCall(context.userId, email);
    if (!quota.allowed) {
      return {
        text: `Запросы к Луми на этот месяц закончились: ${quota.used} из ${quota.limit}. Поиск по документам и задачам продолжает работать, черновики и ответы вернутся после обновления счёта или смены тарифа.`,
        used: quota.used,
        limit: quota.limit,
        limited: true,
      };
    }

    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    const apiKey = process.env["LOVABLE_API_KEY"];

    const fail = (text: string) => ({ text, used: quota.used, limit: quota.limit, limited: false });

    if (!url || !key) {
      return fail("База недоступна. Обновите страницу и повторите вопрос.");
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

    const contextText = [
      `Хабы: ${(hubs ?? []).map((h) => `${h.name} (${h.description || "без описания"})`).join("; ") || "нет"}`,
      `Задачи:`,
      ...(tasks ?? []).map(
        (t) =>
          `- ${t.title} | хаб: ${hubName(t.hub_id)} | приоритет: ${t.priority} | колонка: ${t.board_column} | на сегодня: ${t.is_today ? "да" : "нет"} | выполнена: ${t.is_done ? "да" : "нет"}`,
      ),
    ].join("\n");

    if (!apiKey) {
      return fail(
        "Ключ доступа к модели не настроен. Добавьте его в настройках проекта, чтобы Луми отвечал.",
      );
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
              contextText,
          },
          { role: "user", content: data.question },
        ],
      }),
    });

    if (res.status === 429) {
      return fail("Лимит запросов исчерпан. Попробуйте позже.");
    }
    if (!res.ok) {
      return fail(`Ответ не получен, код ${res.status}. Повторите вопрос через минуту.`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return fail(json.choices?.[0]?.message?.content ?? "Ответ пустой. Повторите вопрос.");
  });
