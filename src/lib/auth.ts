import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

const COOKIE_NAME = "ct_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.NEXTAUTH_SECRET || "change-this-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function encodeSession(userId: number) {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function decodeSession(value?: string) {
  if (!value) return null;
  const [userId, expires, signature] = value.split(".");
  const payload = `${userId}.${expires}`;
  if (!userId || !expires || !signature) return null;
  if (sign(payload) !== signature) return null;
  if (Number(expires) < Date.now()) return null;
  return Number(userId);
}

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminUser() {
  const jar = await cookies();
  const id = decodeSession(jar.get(COOKIE_NAME)?.value);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true } });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
