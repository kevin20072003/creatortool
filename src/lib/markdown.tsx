import { splitList } from "./strings";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inline(value: string) {
  const safe = escapeHtml(value);
  return safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.startsWith("### ")) html.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith("## ")) html.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("# ")) html.push(`<h1>${inline(line.slice(2))}</h1>`);
    else html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return html.join("");
}

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  return <div className={`prose-content ${className}`} dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />;
}

export function keywordsJson(value?: string | null) {
  return JSON.stringify(splitList(value));
}
