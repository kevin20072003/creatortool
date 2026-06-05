"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin, requireAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeInput, slugify } from "@/lib/strings";

function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true";
}

function intValue(form: FormData, key: string) {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? value : 0;
}

function nullableInt(form: FormData, key: string) {
  const value = Number(form.get(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export async function loginAction(form: FormData) {
  const email = sanitizeInput(form.get("email")).toLowerCase();
  const password = String(form.get("password") || "");
  const ok = await loginAdmin(email, password);
  if (!ok) redirect("/admin?error=Invalid%20email%20or%20password");
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin");
}

export async function saveToolAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id") || 0);
  const name = sanitizeInput(form.get("name"));
  const slug = slugify(sanitizeInput(form.get("slug")) || name);
  const data = {
    name,
    slug,
    description: sanitizeInput(form.get("description")),
    content: sanitizeInput(form.get("content")),
    templateType: sanitizeInput(form.get("templateType")) || "content-only",
    status: sanitizeInput(form.get("status")) || "draft",
    featured: bool(form, "featured"),
    popular: bool(form, "popular"),
    iconName: sanitizeInput(form.get("iconName")) || null,
    customAds: bool(form, "customAds"),
    scanType: sanitizeInput(form.get("scanType")) || null,
    frameRate: form.get("frameRate") ? Number(form.get("frameRate")) : null,
    fieldRate: form.get("fieldRate") ? Number(form.get("fieldRate")) : null,
    videoFormatPreset: sanitizeInput(form.get("videoFormatPreset")) || null,
    interlaceWarnings: bool(form, "interlaceWarnings"),
    onlineDeliveryRecommendation: bool(form, "onlineDeliveryRecommendation"),
    featuredImage: sanitizeInput(form.get("featuredImage")) || null,
    seoTitle: sanitizeInput(form.get("seoTitle")) || null,
    seoDescription: sanitizeInput(form.get("seoDescription")) || null,
    keywords: sanitizeInput(form.get("keywords")) || null,
    sortOrder: intValue(form, "sortOrder"),
    categoryId: nullableInt(form, "categoryId"),
  };
  const tool = id
    ? await prisma.tool.update({ where: { id }, data })
    : await prisma.tool.create({ data });

  await prisma.adminLog.create({
    data: { action: id ? "updated" : "created", entity: "Tool", entityId: tool.id, message: `${id ? "Updated" : "Created"} ${tool.name}` },
  }).catch(() => {});

  await prisma.fAQ.deleteMany({ where: { toolId: tool.id } });
  const faqLines = sanitizeInput(form.get("faqs")).split("\n").map((line) => line.trim()).filter(Boolean);
  if (faqLines.length) {
    await prisma.fAQ.createMany({
      data: faqLines.map((line, index) => {
        const [question, ...rest] = line.split("|");
        return { toolId: tool.id, question: question.trim(), answer: rest.join("|").trim() || "Update this answer.", sortOrder: index };
      }),
    });
  }

  await prisma.toolRelation.deleteMany({ where: { sourceToolId: tool.id } });
  const relatedIds = sanitizeInput(form.get("relatedTools")).split(",").map((value) => Number(value.trim())).filter((value) => value && value !== tool.id);
  for (const relatedToolId of relatedIds) {
    await prisma.toolRelation.upsert({
      where: { sourceToolId_relatedToolId: { sourceToolId: tool.id, relatedToolId } },
      update: {},
      create: { sourceToolId: tool.id, relatedToolId },
    });
  }

  revalidatePath("/");
  revalidatePath("/tools");
  redirect("/admin/tools");
}

export async function deleteToolAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  await prisma.tool.delete({ where: { id } });
  await prisma.adminLog.create({ data: { action: "deleted", entity: "Tool", entityId: id, message: "Deleted tool" } }).catch(() => {});
  revalidatePath("/tools");
  redirect("/admin/tools");
}

export async function bulkToolAction(form: FormData) {
  await requireAdmin();
  const action = sanitizeInput(form.get("bulkAction"));
  const ids = form.getAll("toolIds").map((value) => Number(value)).filter(Boolean);
  if (!ids.length) redirect("/admin/tools");
  if (action === "publish") await prisma.tool.updateMany({ where: { id: { in: ids } }, data: { status: "published" } });
  if (action === "unpublish") await prisma.tool.updateMany({ where: { id: { in: ids } }, data: { status: "draft" } });
  if (action === "delete") await prisma.tool.deleteMany({ where: { id: { in: ids } } });
  await prisma.adminLog.create({ data: { action: `bulk-${action}`, entity: "Tool", message: `${action} ${ids.length} tool(s)` } }).catch(() => {});
  revalidatePath("/tools");
  redirect("/admin/tools");
}

export async function saveBlogAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id") || 0);
  const title = sanitizeInput(form.get("title"));
  const status = sanitizeInput(form.get("status")) || "draft";
  const data = {
    title,
    slug: slugify(sanitizeInput(form.get("slug")) || title),
    excerpt: sanitizeInput(form.get("excerpt")),
    content: sanitizeInput(form.get("content")),
    featuredImage: sanitizeInput(form.get("featuredImage")) || null,
    status,
    seoTitle: sanitizeInput(form.get("seoTitle")) || null,
    seoDescription: sanitizeInput(form.get("seoDescription")) || null,
    tags: sanitizeInput(form.get("tags")) || null,
    categoryId: nullableInt(form, "categoryId"),
    publishedAt: status === "published" ? new Date() : null,
  };
  if (id) await prisma.blogPost.update({ where: { id }, data });
  else await prisma.blogPost.create({ data });
  await prisma.adminLog.create({ data: { action: id ? "updated" : "created", entity: "BlogPost", entityId: id || undefined, message: title } }).catch(() => {});
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogAction(form: FormData) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id: Number(form.get("id")) } });
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function saveCategoryAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id") || 0);
  const name = sanitizeInput(form.get("name"));
  const data = {
    name,
    slug: slugify(sanitizeInput(form.get("slug")) || name),
    description: sanitizeInput(form.get("description")) || null,
    icon: sanitizeInput(form.get("icon")) || null,
    seoTitle: sanitizeInput(form.get("seoTitle")) || null,
    seoDescription: sanitizeInput(form.get("seoDescription")) || null,
    sortOrder: intValue(form, "sortOrder"),
  };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });
  revalidatePath("/tools");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(form: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: Number(form.get("id")) } });
  redirect("/admin/categories");
}

export async function savePageAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id") || 0);
  const title = sanitizeInput(form.get("title"));
  const data = {
    title,
    slug: slugify(sanitizeInput(form.get("slug")) || title),
    content: sanitizeInput(form.get("content")),
    seoTitle: sanitizeInput(form.get("seoTitle")) || null,
    seoDescription: sanitizeInput(form.get("seoDescription")) || null,
  };
  if (id) await prisma.page.update({ where: { id }, data });
  else await prisma.page.create({ data });
  revalidatePath("/");
  redirect("/admin/pages");
}

export async function deletePageAction(form: FormData) {
  await requireAdmin();
  await prisma.page.delete({ where: { id: Number(form.get("id")) } });
  redirect("/admin/pages");
}

export async function saveAdsAction(form: FormData) {
  await requireAdmin();
  for (const name of ["header", "in-content", "sidebar", "footer"]) {
    const code = String(form.get(name) || "").trim();
    await prisma.adSlot.upsert({
      where: { name },
      update: { code, enabled: bool(form, `${name}-enabled`) },
      create: { name, code, enabled: bool(form, `${name}-enabled`) },
    });
  }
  revalidatePath("/");
  redirect("/admin/adsense");
}

export async function saveSettingsAction(form: FormData) {
  await requireAdmin();
  const keys = ["siteName", "siteLogo", "siteFavicon", "adminEmail", "socialLinks", "footerText", "maintenanceMode", "darkModeDefault", "homeHeroTitle", "homeHeroSubtitle"];
  for (const key of keys) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: sanitizeInput(form.get(key)) },
      create: { key, value: sanitizeInput(form.get(key)), group: "general" },
    });
  }
  revalidatePath("/");
  redirect("/admin/settings");
}

export async function saveSeoAction(form: FormData) {
  await requireAdmin();
  const keys = ["globalTitle", "globalDescription", "ogImage", "robots", "googleAnalytics", "searchConsole"];
  for (const key of keys) {
    const value = key === "googleAnalytics" || key === "searchConsole" ? String(form.get(key) || "").trim() : sanitizeInput(form.get(key));
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "seo" },
    });
  }
  revalidatePath("/");
  redirect("/admin/seo");
}

export async function uploadMediaAction(form: FormData) {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) redirect("/admin/media");
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  await prisma.media.create({
    data: { filename, url: `/uploads/${filename}`, mimeType: file.type, size: file.size, alt: sanitizeInput(form.get("alt")) || null },
  });
  redirect("/admin/media");
}

export async function deleteMediaAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const media = await prisma.media.findUnique({ where: { id } });
  if (media) {
    await prisma.media.delete({ where: { id } });
    await unlink(path.join(process.cwd(), "public", media.url.replace(/^\//, ""))).catch(() => {});
  }
  redirect("/admin/media");
}

export async function changePasswordAction(form: FormData) {
  const user = await requireAdmin();
  const password = String(form.get("password") || "");
  if (password.length < 8) redirect("/admin/change-password?error=Password%20must%20be%208%20characters");
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  redirect("/admin/change-password?success=Password%20updated");
}
