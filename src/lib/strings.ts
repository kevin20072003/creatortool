export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function excerpt(value: string, length = 155) {
  const text = value.replace(/[#*_>`\[\]()]/g, "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1).trim()}...` : text;
}

export function splitList(value?: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sanitizeInput(value: FormDataEntryValue | null) {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .trim();
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
