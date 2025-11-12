'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/utils/prismaClient";

// Simple per-session in-memory rate limiter
const RATE_LIMIT_WINDOW = 20_000; // 20 seconds
const MAX_ACTIONS = 3;            // max 3 follow/unfollow per window
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record) {
    rateLimitMap.set(userId, { count: 1, lastReset: now });
    return false;
  }
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, lastReset: now });
    return false;
  }
  if (record.count >= MAX_ACTIONS) return true;

  record.count++;
  return false;
}

export async function followUser(targetUserId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (!currentUserId) throw new Error("Unauthorized");
  if (currentUserId === targetUserId)
    throw new Error("Users cannot follow themselves");

  if (isRateLimited(currentUserId)) {
    throw new Error("Too many follow/unfollow requests. Please wait a moment.");
  }

  try {
    await prisma.followUser(currentUserId, targetUserId);
  } catch (err) {
    console.error("Error in followUser server action:", err);
    throw new Error("Failed to follow/unfollow user");
  }
}
export async function unfollowUser(targetUserId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (!currentUserId) throw new Error("Unauthorized");
  if (currentUserId === targetUserId)
    throw new Error("Users cannot unfollow themselves");

  if (isRateLimited(currentUserId)) {
    throw new Error("Too many follow/unfollow requests. Please wait a moment.");
  }

  try {
    await prisma.unfollowUser(currentUserId, targetUserId);
  } catch (err) {
    console.error("Error in unfollowUser server action:", err);
    throw new Error("Failed to unfollow user");
  }
}
