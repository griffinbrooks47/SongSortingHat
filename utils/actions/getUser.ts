'use server';

/* Prisma */
import { prisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma/client";

const userInclude = {
  profilePicture: true,
} satisfies Prisma.UserInclude;
export type TUserWithImage = Prisma.UserGetPayload<{ include: typeof userInclude }>;

export async function getUserWithImage(userId: string): Promise<TUserWithImage | null> {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: userInclude,
    }) as TUserWithImage | null;
}