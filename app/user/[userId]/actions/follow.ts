'use server'

import { prisma } from "@/lib/db";

export async function followUser(userId: string, userIdToFollow: string) {
  await prisma.$transaction(async (tx) => {
    const existingFollow = await tx.follow.findUnique({
      where: {
        followerUserId_followingUserId: {
          followerUserId: userId,
          followingUserId: userIdToFollow,
        },
      },
    });
    if (existingFollow) {
      await tx.follow.update({
        where: {
          followerUserId_followingUserId: {
            followerUserId: userId,
            followingUserId: userIdToFollow,
          },
        },
        data: { updatedAt: new Date() },
      });
    } else {
      await tx.follow.create({
        data: {
          followerUserId: userId,
          followingUserId: userIdToFollow,
        },
      }); 
      await tx.user.update({
        where: { id: userId },
        data: { followingCount: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: userIdToFollow },
        data: { followersCount: { increment: 1 } },
      });
    }
  });
}
export async function unfollowUser(userId: string, userIdToUnfollow: string) {
  await prisma.$transaction(async (tx) => {
    const existingFollow = await tx.follow.findUnique({
      where: {
        followerUserId_followingUserId: {
          followerUserId: userId,
          followingUserId: userIdToUnfollow,
        },
      },
    });
    if (!existingFollow) {
      return;
    }
    await tx.follow.delete({
      where: {
        followerUserId_followingUserId: {
          followerUserId: userId,
          followingUserId: userIdToUnfollow,
        },
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: { followingCount: { decrement: 1 } },
    });
    await tx.user.update({
      where: { id: userIdToUnfollow },
      data: { followersCount: { decrement: 1 } },
    });
  });
}
