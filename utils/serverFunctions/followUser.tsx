'use server'

/* Next / React */
import { headers } from "next/headers";

/* Auth */
import { auth } from "@/lib/auth";

/* Prisma */
import { prisma } from "@/lib/db";

const RATE_LIMIT_WINDOW = 20_000;
const MAX_ACTIONS = 3;
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
    if (currentUserId === targetUserId) {
        throw new Error("Users cannot follow themselves");
    }
    await prisma.$transaction(async (tx) => {
      const alreadyFollowing = await tx.user.findFirst({
      where: {
          id: currentUserId,
          following: { some: { id: targetUserId } },
      },
      select: { id: true },
      });

      if (alreadyFollowing) {
          throw new Error("Already following this user");
      }

      await tx.user.update({
      where: { id: currentUserId },
      data: {
          following: { connect: { id: targetUserId } },
          followingCount: { increment: 1 },
      },
      });

      await tx.user.update({
      where: { id: targetUserId },
      data: {
          followers: { connect: { id: currentUserId } },
          followerCount: { increment: 1 },
      },
      });
    });
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
    if (currentUserId === targetUserId) {
        throw new Error("Users cannot unfollow themselves");
    }

    await prisma.$transaction(async (tx) => {
      const isFollowing = await tx.user.findFirst({
      where: {
          id: currentUserId,
          following: { some: { id: targetUserId } },
      },
      select: { id: true },
      });

      if (!isFollowing) {
          throw new Error("You are not following this user");
      }

      await tx.user.update({
      where: { id: currentUserId },
      data: {
          following: { disconnect: { id: targetUserId } },
          followingCount: { decrement: 1 },
      },
      });

      await tx.user.update({
      where: { id: targetUserId },
      data: {
          followers: { disconnect: { id: currentUserId } },
          followerCount: { decrement: 1 },
      },
      });
    });
  } catch (err) {
    console.error("Error in unfollowUser server action:", err);
    throw new Error("Failed to unfollow user");
  }
}
