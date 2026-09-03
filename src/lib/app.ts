import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export type AppState = {
  id: string;
  streak: number;
  best_streak: number;
  last_streak_date: string | null;
  theme: "light" | "dark";
  lumi_enabled: boolean;
  streaks_enabled: boolean;
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

export const HALO_LEVELS: { name: string; min: number; max: number | null; what: string }[] = [
  { name: "Spark", min: 1, max: 6, what: "The halo lights up on the first closed task of a day" },
  { name: "Ray", min: 7, max: 20, what: "A full week of days that counted" },
  { name: "Glow", min: 21, max: 49, what: "Three weeks — the habit holds on its own" },
  { name: "Beacon", min: 50, max: 99, what: "Fifty days of steady work" },
  { name: "Constellation", min: 100, max: null, what: "A hundred days and beyond, the highest level" },
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
      if (data) return data as AppState;
      const created = await supabase
        .from("app_state")
        .insert({ id: "main" })
        .select()
        .single();
      if (created.error) throw created.error;
      return created.data as AppState;
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

export function useUpdateState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppState>) => {
      const { error } = await supabase
        .from("app_state")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", "main");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app_state"] }),
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
  const state = data as AppState;
  if (!state.streaks_enabled) return false;
  const today = todayISO();
  if (state.last_streak_date === today) return false;
  const next =
    state.last_streak_date === shiftISO(today, -1) ? state.streak + 1 : 1;
  const { error: upErr } = await supabase
    .from("app_state")
    .update({
      streak: next,
      best_streak: Math.max(next, state.best_streak),
      last_streak_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main");
  return !upErr;
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
    }) => {
      const { error } = await supabase.from("tasks").insert({
        title: input.title,
        hub_id: input.hub_id,
        priority: input.priority,
        is_today: input.is_today ?? false,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const patchTask = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
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
    onSuccess: (grew, task) => {
      refresh();
      announce(
        task.is_done
          ? `Task ${task.title} reopened`
          : `Task ${task.title} completed`,
      );
      if (grew) window.dispatchEvent(new CustomEvent(STREAK_EVENT));
    },
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
    onSuccess: (grew, { task, column }) => {
      refresh();
      announce(
        `Task ${task.title} moved to ${COLUMNS.find((c) => c.key === column)?.label}`,
      );
      if (grew) window.dispatchEvent(new CustomEvent(STREAK_EVENT));
    },
  });

  const removeTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return { createTask, patchTask, completeTask, moveTask, removeTask };
}

export function useHubMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["hubs"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createHub = useMutation({
    mutationFn: async (input: { name: string; description: string; color: string }) => {
      const { error } = await supabase.from("hubs").insert(input);
      if (error) throw error;
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
    mutationFn: async (hub_id: string) => {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          hub_id,
          title: "Untitled doc",
          blocks: [{ id: crypto.randomUUID(), type: "paragraph", text: "" }],
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
