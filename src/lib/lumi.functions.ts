import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ question: z.string().min(1).max(600) });

export const askLumi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { consumeAiCall } = await import("@/lib/billing.server");
    const email = (context.claims["email"] as string | undefined) ?? "";

    // The request counter is incremented on the server, the client cannot change it.
    const quota = await consumeAiCall(context.userId, email);
    if (!quota.allowed) {
      return {
        text: `Lumi requests for this month are used up: ${quota.used} of ${quota.limit}. Search across your docs and tasks keeps working, drafts and answers return after the counter resets or the plan changes.`,
        used: quota.used,
        limit: quota.limit,
        limited: true,
      };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];

    const fail = (text: string) => ({ text, used: quota.used, limit: quota.limit, limited: false });

    const [{ data: hubs }, { data: tasks }] = await Promise.all([
      context.supabase.from("hubs").select("id,name,description").order("position"),
      context.supabase
        .from("tasks")
        .select("title,hub_id,priority,board_column,is_today,is_done")
        .order("created_at"),
    ]);

    const hubName = (id: string | null) =>
      hubs?.find((h) => h.id === id)?.name ?? "no hub";

    const contextText = [
      `Hubs: ${(hubs ?? []).map((h) => `${h.name} (${h.description || "no description"})`).join("; ") || "none"}`,
      `Tasks:`,
      ...(tasks ?? []).map(
        (t) =>
          `- ${t.title} | hub: ${hubName(t.hub_id)} | priority: ${t.priority} | column: ${t.board_column} | today: ${t.is_today ? "yes" : "no"} | done: ${t.is_done ? "yes" : "no"}`,
      ),
    ].join("\n");

    if (!apiKey) {
      return fail(
        "The model key is not configured. Add it in the project settings so Lumi can answer.",
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
              "You are Lumi, the assistant inside Luvion. Answer in English, calmly and briefly, with no emoji and no exclamation marks. State facts, never praise abstractly. Use only the user data below and invent nothing. When the data is missing, say so plainly and name the next step.\n\n" +
              contextText,
          },
          { role: "user", content: data.question },
        ],
      }),
    });

    if (res.status === 429) {
      return fail("The model rate limit is reached. Try again in a few minutes.");
    }
    if (!res.ok) {
      return fail(`No answer came back, status ${res.status}. Ask again in a minute.`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return fail(json.choices?.[0]?.message?.content ?? "The answer came back empty. Ask again.");
  });
