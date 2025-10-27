'use server';

import prisma from '@/utils/prismaClient';

export async function getUser(userId: string) {
  if (!userId) return null;

  try {
    const user = await prisma.getUser(userId);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
