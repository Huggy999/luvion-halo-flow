import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";


export type Hub = {
  id: string;
  name: string;
  description: string;
  color: string;
  position: number;
};

export type Priority = "p1" | "p2" | "p3";
export type BoardColumn = "backlog" | "doing" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  hub_id: string | null;
  priority: Priority;
  board_column: BoardColumn;
  is_today: boolean;
  is_done: boolean;
  done_at: string | null;
  position: number;
  focus_sessions: number;
  created_at: string;
};

export type Block = {
  id: string;
  type: "heading" | "paragraph" | "check" | "callout";
  text: string;
  checked?: boolean;
};

export type Doc = {
  id: string;
  hub_id: string | null;
  title: string;
  blocks: Block[];
  updated_at: string;
};

export type HaloLogEntry = { day: number; level: string };

export type AppState = {
  id: string;
  streak: number;
  best_streak: number;
  last_streak_date: string | null;
  theme: "light" | "dark";
  lumi_enabled: boolean;
  streaks_enabled: boolean;
  onboarded: boolean;
  display_name: string;
  halo_log: HaloLogEntry[];
  freeze_month: string;
  freeze_notice: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "lumi";
  content: string;
  created_at: string;
};


export const COLUMNS: { key: BoardColumn; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "doing", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export const WIP_LIMIT = 3;

export type DocTemplateKey = "blank" | "meeting" | "weekly" | "brief" | "decision";

export const DOC_TEMPLATES: {
  key: DocTemplateKey;
  name: string;
  description: string;
  blocks: { type: Block["type"]; text: string }[];
}[] = [
  {
    key: "blank",
    name: "Blank page",
    description: "Start from nothing",
    blocks: [{ type: "paragraph", text: "" }],
  },
  {
    key: "meeting",
    name: "Meeting notes",
    description: "Who was there, what was decided",
    blocks: [
      { type: "heading", text: "Meeting notes" },
      { type: "paragraph", text: "Date and who was there" },
      { type: "heading", text: "Decisions" },
      { type: "check", text: "" },
      { type: "heading", text: "Next steps" },
      { type: "check", text: "" },
    ],
  },
  {
    key: "weekly",
    name: "Weekly review",
    description: "What moved, what did not",
    blocks: [
      { type: "heading", text: "Weekly review" },
      { type: "heading", text: "What moved" },
      { type: "paragraph", text: "" },
      { type: "heading", text: "What did not" },
      { type: "paragraph", text: "" },
      { type: "heading", text: "One thing for next week" },
      { type: "check", text: "" },
    ],
  },
  {
    key: "brief",
    name: "Project brief",
    description: "The shape of a new direction",
    blocks: [
      { type: "heading", text: "Project brief" },
      { type: "callout", text: "One sentence on why this exists" },
      { type: "heading", text: "What done looks like" },
      { type: "paragraph", text: "" },
      { type: "heading", text: "First three steps" },
      { type: "check", text: "" },
      { type: "check", text: "" },
      { type: "check", text: "" },
    ],
  },
  {
    key: "decision",
    name: "Decision log",
    description: "What was chosen and why",
    blocks: [
      { type: "heading", text: "Decision" },
      { type: "paragraph", text: "" },
      { type: "heading", text: "Why this and not the alternative" },
      { type: "paragraph", text: "" },
      { type: "heading", text: "What would change our mind" },
      { type: "paragraph", text: "" },
    ],
  },
];

export const HUB_COLORS = [
  { key: "blue", label: "Blue", value: "var(--blue)" },
  { key: "mint", label: "Mint", value: "var(--mint)" },
  { key: "coral", label: "Coral", value: "var(--coral)" },
  { key: "lilac", label: "Lilac", value: "var(--lilac)" },
  { key: "halo", label: "Gold", value: "var(--halo)" },
];

export function hubColor(key: string) {
  return HUB_COLORS.find((c) => c.key === key)?.value ?? "var(--blue)";
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  p1: "Important",
  p2: "Normal",
  p3: "Later",
};

/** One phrasing for the streak everywhere: "1 day in a row", "4 days in a row". */
export function streakLabel(days: number) {
  return `${days} ${days === 1 ? "day" : "days"} in a row`;
}

export type HaloSkin = "spark" | "ray" | "glow" | "beacon" | "constellation";

export const HALO_LEVELS: {
  name: string;
  min: number;
  max: number | null;
  what: string;
  skin: HaloSkin;
  ring: string;
}[] = [
  {
    name: "Spark",
    min: 1,
    max: 6,
    what: "The halo lights up on the first closed task of a day",
    skin: "spark",
    ring: "A thin blue ring",
  },
  {
    name: "Ray",
    min: 7,
    max: 20,
    what: "A full week of days that counted",
    skin: "ray",
    ring: "A gold ring",
  },
  {
    name: "Glow",
    min: 21,
    max: 49,
    what: "Three weeks — the habit holds on its own",
    skin: "glow",
    ring: "A gold ring with rays",
  },
  {
    name: "Beacon",
    min: 50,
    max: 99,
    what: "Fifty days of steady work",
    skin: "beacon",
    ring: "A double ring",
  },
  {
    name: "Constellation",
    min: 100,
    max: null,
    what: "A hundred days and beyond, the highest level",
    skin: "constellation",
    ring: "A ring of dots",
  },
];

export function haloSkin(streak: number): HaloSkin {
  if (streak >= 100) return "constellation";
  if (streak >= 50) return "beacon";
  if (streak >= 21) return "glow";
  if (streak >= 7) return "ray";
  return "spark";
}

/** Hub templates offered during onboarding. Fixed for everyone, no random data. */
export const HUB_TEMPLATES: {
  name: string;
  description: string;
  color: string;
  tasks: string[];
}[] = [
  {
    name: "Work",
    description: "The job and everything it asks for",
    color: "blue",
    tasks: ["Reply to the open messages", "Plan the week ahead", "Finish one thing left over"],
  },
  {
    name: "Study",
    description: "Courses, reading and practice",
    color: "lilac",
    tasks: ["Read one chapter", "Review yesterday's notes", "Do one practice set"],
  },
  {
    name: "Personal",
    description: "Life outside work",
    color: "mint",
    tasks: ["Tidy one room", "Call someone close", "Plan the weekend"],
  },
  {
    name: "Product",
    description: "What you are building",
    color: "coral",
    tasks: ["Write down the next step", "Talk to one user", "Fix the smallest bug"],
  },
  {
    name: "Health",
    description: "Body, sleep and food",
    color: "halo",
    tasks: ["Walk for thirty minutes", "Cook one real meal", "Go to bed on time"],
  },
  {
    name: "Side project",
    description: "The thing you do for yourself",
    color: "blue",
    tasks: ["Spend one session on it", "Write the next idea down", "Clean up what exists"],
  },
];


export function haloLevel(streak: number) {

  if (streak >= 100) return { name: "Constellation", min: 100, next: null as number | null };
  if (streak >= 50) return { name: "Beacon", min: 50, next: 100 };
  if (streak >= 21) return { name: "Glow", min: 21, next: 50 };
  if (streak >= 7) return { name: "Ray", min: 7, next: 21 };
  return { name: "Spark", min: 1, next: 7 };
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Month key such as "2026-09" — the halo pause is one per calendar month. */
export function monthKey(iso: string) {
  return iso.slice(0, 7);
}


/* ---------- aria-live announcements ---------- */

type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export function announce(message: string) {
  listeners.forEach((l) => l(message));
}

export function onAnnounce(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ---------- undo offers ---------- */

export type UndoOffer = { message: string; onUndo: () => void };
type UndoListener = (o: UndoOffer) => void;
const undoListeners = new Set<UndoListener>();

export function offerUndo(o: UndoOffer) {
  undoListeners.forEach((l) => l(o));
}

export function onUndoOffer(l: UndoListener) {
  undoListeners.add(l);
  return () => undoListeners.delete(l);
}

export const STREAK_EVENT = "luvion:streak-up";


/* ---------- queries ---------- */

export function useHubs() {
  return useQuery({
    queryKey: ["hubs"],
    queryFn: async (): Promise<Hub[]> => {
      const { data, error } = await supabase
        .from("hubs")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Hub[];
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useDocs() {
  return useQuery({
    queryKey: ["docs"],
    queryFn: async (): Promise<Doc[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Doc[];
    },
  });
}

export function useAppState() {
  return useQuery({
    queryKey: ["app_state"],
    queryFn: async (): Promise<AppState> => {
      const { data, error } = await supabase
        .from("app_state")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as AppState;
      const created = await supabase
        .from("app_state")
        .insert({ id: "main" })
        .select()
        .single();
      if (created.error) throw created.error;
      return created.data as unknown as AppState;

    },
  });
}

export function useChat() {
  return useQuery({
    queryKey: ["chat"],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });
}

/* ---------- mutations ---------- */

function reason(e: unknown) {
  const m = (e as { message?: string })?.message;
  return m && m.trim() ? m : "no response from the server";
}

export function useUpdateState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppState>) => {
      const { error } = await supabase
        .from("app_state")
        .update({ ...patch, updated_at: new Date().toISOString() } as never)
        .eq("id", "main");
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["app_state"] });
      const snapshot = qc.getQueryData<AppState>(["app_state"]);
      if (snapshot) qc.setQueryData<AppState>(["app_state"], { ...snapshot, ...patch });
      return { snapshot };
    },
    onError: (error, _patch, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(["app_state"], ctx.snapshot);
      announce(`Couldn't save the setting — ${reason(error)}. The change was undone.`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["app_state"] }),
  });
}


/** Counts one halo day for the first task closed on a calendar day. */
async function registerStreakDay(): Promise<boolean> {
  const { data, error } = await supabase
    .from("app_state")
    .select("*")
    .eq("id", "main")
    .single();
  if (error || !data) return false;
  const state = data as unknown as AppState;
  if (!state.streaks_enabled) return false;
  const today = todayISO();
  if (state.last_streak_date === today) return false;
  const next =
    state.last_streak_date === shiftISO(today, -1) ? state.streak + 1 : 1;
  const log = Array.isArray(state.halo_log) ? state.halo_log : [];
  const reached = haloLevel(next).name;
  const nextLog =
    haloLevel(Math.max(next - 1, 1)).name !== reached || next === 1
      ? [...log.filter((e) => e.level !== reached), { day: next, level: reached }]
      : log;
  const { error: upErr } = await supabase
    .from("app_state")
    .update({
      streak: next,
      best_streak: Math.max(next, state.best_streak),
      last_streak_date: today,
      halo_log: nextLog,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", "main");
  return !upErr;
}

/**
 * One pause per calendar month. A single missed day is covered automatically and
 * the halo keeps going; the next visit says so once, calmly.
 */
export function useHaloGuard() {
  const qc = useQueryClient();
  const { data: state } = useAppState();
  const applied = useRef(false);

  useEffect(() => {
    if (!state || applied.current) return;
    if (!state.streaks_enabled || state.streak <= 0 || !state.last_streak_date) return;
    const today = todayISO();
    const missedOneDay = state.last_streak_date === shiftISO(today, -2);
    if (!missedOneDay) return;
    if (state.freeze_month === monthKey(today)) return;
    applied.current = true;
    void (async () => {
      await supabase
        .from("app_state")
        .update({
          last_streak_date: shiftISO(today, -1),
          freeze_month: monthKey(today),
          freeze_notice: true,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", "main");
      await qc.invalidateQueries({ queryKey: ["app_state"] });
    })();
  }, [state, qc]);
}


export function useTaskMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["app_state"] });
  };

  const createTask = useMutation({
    mutationFn: async (input: {
      title: string;
      hub_id: string | null;
      priority: Priority;
      is_today?: boolean;
      focus_sessions?: number;
    }) => {
      const { error } = await supabase.from("tasks").insert({
        title: input.title,
        hub_id: input.hub_id,
        priority: input.priority,
        is_today: input.is_today ?? false,
        focus_sessions: input.focus_sessions ?? 1,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
  });


  /** Local cache edit shared by every optimistic task mutation. */
  const optimistic = async (edit: (tasks: Task[]) => Task[]) => {
    await qc.cancelQueries({ queryKey: ["tasks"] });
    const snapshot = qc.getQueryData<Task[]>(["tasks"]);
    if (snapshot) qc.setQueryData<Task[]>(["tasks"], edit(snapshot));
    return { snapshot };
  };

  const rollback = (ctx: { snapshot?: Task[] } | undefined) => {
    if (ctx?.snapshot) qc.setQueryData(["tasks"], ctx.snapshot);
  };

  const patchTask = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id, patch }) =>
      optimistic((tasks) => tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    onError: (error, _vars, ctx) => {
      rollback(ctx);
      announce(`Couldn't save the task — ${reason(error)}. The change was undone.`);
    },
    onSettled: refresh,
  });

  const completeTask = useMutation({
    mutationFn: async (task: Task) => {
      const done = !task.is_done;
      const { error } = await supabase
        .from("tasks")
        .update({
          is_done: done,
          done_at: done ? new Date().toISOString() : null,
          board_column: done ? "done" : "doing",
        })
        .eq("id", task.id);
      if (error) throw error;
      if (done) return await registerStreakDay();
      return false;
    },
    onMutate: async (task) => {
      const done = !task.is_done;
      const ctx = await optimistic((tasks) =>
        tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                is_done: done,
                done_at: done ? new Date().toISOString() : null,
                board_column: done ? ("done" as BoardColumn) : ("doing" as BoardColumn),
              }
            : t,
        ),
      );
      haptic(10);
      announce(done ? `Task ${task.title} completed` : `Task ${task.title} reopened`);
      return ctx;
    },
    onError: (error, task, ctx) => {
      rollback(ctx);
      announce(
        `Couldn't ${task.is_done ? "reopen" : "close"} ${task.title} — ${reason(error)}. The change was undone.`,
      );
    },
    onSuccess: (grew) => {
      if (grew) window.dispatchEvent(new CustomEvent(STREAK_EVENT));
    },
    onSettled: refresh,
  });

  const moveTask = useMutation({
    mutationFn: async ({ task, column }: { task: Task; column: BoardColumn }) => {
      const done = column === "done";
      const { error } = await supabase
        .from("tasks")
        .update({
          board_column: column,
          is_done: done,
          done_at: done ? new Date().toISOString() : null,
        })
        .eq("id", task.id);
      if (error) throw error;
      if (done && !task.is_done) return await registerStreakDay();
      return false;
    },
    onMutate: async ({ task, column }) => {
      const done = column === "done";
      const ctx = await optimistic((tasks) =>
        tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                board_column: column,
                is_done: done,
                done_at: done ? new Date().toISOString() : null,
              }
            : t,
        ),
      );
      announce(
        `Task ${task.title} moved to ${COLUMNS.find((c) => c.key === column)?.label}`,
      );
      return ctx;
    },
    onError: (error, { task }, ctx) => {
      rollback(ctx);
      announce(`Couldn't move ${task.title} — ${reason(error)}. The change was undone.`);
    },
    onSuccess: (grew) => {
      if (grew) window.dispatchEvent(new CustomEvent(STREAK_EVENT));
    },
    onSettled: refresh,
  });

  const removeTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: (id) => optimistic((tasks) => tasks.filter((t) => t.id !== id)),
    onError: (error, _id, ctx) => {
      rollback(ctx);
      announce(`Couldn't delete the task — ${reason(error)}. The change was undone.`);
    },
    onSettled: refresh,
  });

  /** Puts a deleted task back exactly as it was, id and created_at included. */
  const restoreTask = useMutation({
    mutationFn: async (task: Task) => {
      const { error } = await supabase.from("tasks").insert(task as never);
      if (error) throw error;
    },
    onMutate: (task) =>
      optimistic((tasks) =>
        tasks.some((t) => t.id === task.id)
          ? tasks
          : [...tasks, task].sort((a, b) => a.created_at.localeCompare(b.created_at)),
      ),
    onError: (error, task, ctx) => {
      rollback(ctx);
      announce(`Couldn't bring ${task.title} back — ${reason(error)}. The change was undone.`);
    },
    onSettled: refresh,
  });

  return { createTask, patchTask, completeTask, moveTask, removeTask, restoreTask };
}


export function useHubMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["hubs"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createHub = useMutation({
    mutationFn: async (input: { name: string; description: string; color: string }) => {
      const { data, error } = await supabase.from("hubs").insert(input).select().single();
      if (error) throw error;
      return data as Hub;
    },
    onSuccess: refresh,
  });


  const removeHub = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return { createHub, removeHub };
}

export function useDocMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["docs"] });

  const createDoc = useMutation({
    mutationFn: async ({
      hub_id,
      template = "blank",
    }: {
      hub_id: string;
      template?: DocTemplateKey;
    }) => {
      const tpl = DOC_TEMPLATES.find((t) => t.key === template) ?? DOC_TEMPLATES[0]!;
      const blocks: Block[] = tpl.blocks.map((b) => ({
        id: crypto.randomUUID(),
        type: b.type,
        text: b.text,
        ...(b.type === "check" ? { checked: false } : {}),
      }));
      const { data, error } = await supabase
        .from("documents")
        .insert({
          hub_id,
          title: tpl.key === "blank" ? "Untitled doc" : tpl.name,
          blocks,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Doc;
    },
    onSuccess: refresh,
  });

  const saveDoc = useMutation({
    mutationFn: async ({
      id,
      title,
      blocks,
    }: {
      id: string;
      title: string;
      blocks: Block[];
    }) => {
      const { error } = await supabase
        .from("documents")
        .update({ title, blocks, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const removeDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return { createDoc, saveDoc, removeDoc };
}

export async function resetAllData() {
  await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("hubs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("app_state")
    .update({ streak: 0, best_streak: 0, last_streak_date: null })
    .eq("id", "main");
}
