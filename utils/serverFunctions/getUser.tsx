'use server';

import { prisma } from '@/lib/db';
import { User } from '@/prisma/generated/prisma/client';

export async function getUser(userId: string) {
  if (!userId) return null;

  try {
    const user: User | null = await prisma.user.findUnique({
      where: { id: userId }
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
