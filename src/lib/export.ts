import type { Doc, Hub, Task } from "@/lib/app";

function download(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Экспорт работает на любом тарифе, включая просроченную подписку. */
export function exportMarkdown(hubs: Hub[], tasks: Task[], docs: Doc[]) {
  const lines: string[] = ["# Luvion", ""];
  for (const hub of hubs) {
    lines.push(`## ${hub.name}`, hub.description || "", "");
    const list = tasks.filter((t) => t.hub_id === hub.id);
    for (const t of list) {
      lines.push(`- [${t.is_done ? "x" : " "}] ${t.title} (${t.priority.toUpperCase()}, ${t.board_column})`);
    }
    const hubDocs = docs.filter((d) => d.hub_id === hub.id);
    for (const d of hubDocs) {
      lines.push("", `### ${d.title}`);
      for (const b of d.blocks ?? []) {
        if (b.type === "heading") lines.push(`#### ${b.text}`);
        else if (b.type === "check") lines.push(`- [${b.checked ? "x" : " "}] ${b.text}`);
        else if (b.type === "callout") lines.push(`> ${b.text}`);
        else lines.push(b.text);
      }
    }
    lines.push("");
  }
  const loose = tasks.filter((t) => !t.hub_id);
  if (loose.length) {
    lines.push("## Без хаба", "");
    for (const t of loose) lines.push(`- [${t.is_done ? "x" : " "}] ${t.title}`);
  }
  download("luvion.md", "text/markdown", lines.join("\n"));
}

export function exportCsv(hubs: Hub[], tasks: Task[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Задача", "Хаб", "Приоритет", "Колонка", "На сегодня", "Выполнена", "Закрыта"].map(esc).join(","),
    ...tasks.map((t) =>
      [
        t.title,
        hubs.find((h) => h.id === t.hub_id)?.name ?? "",
        t.priority.toUpperCase(),
        t.board_column,
        t.is_today ? "да" : "нет",
        t.is_done ? "да" : "нет",
        t.done_at ?? "",
      ]
        .map((v) => esc(String(v)))
        .join(","),
    ),
  ];
  download("luvion-tasks.csv", "text/csv", rows.join("\n"));
}
