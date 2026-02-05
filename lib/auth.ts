
/* Auth */
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";

/* Prisma */
import { prisma } from "@/lib/db";
import { profile } from "node:console";
import { Prisma } from "@/prisma/generated/prisma/browser";

const userInclude = {
  profilePicture: true,
} satisfies Prisma.UserInclude;
type UserWithProfilePicture = Prisma.UserGetPayload<{ include: typeof userInclude }>;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true, 
    }, 
    socialProviders: {
        google: { 
            redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
        spotify: { 
            clientId: process.env.SPOTIFY_CLIENT_ID as string, 
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string, 
        }, 
    }, 
    user: {
        additionalFields: {
            username: {
                type: "string",
                defaultValue: "",
            },
            role: {
                type: "string",
                input: false
            },
            followersCount: {
                type: "number",
                defaultValue: 0,
                input: false
            },
            followingCount: {
                type: "number",
                defaultValue: 0,
                input: false
            },
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const newSession = ctx.context.newSession;
            if (newSession) {
                const user = await prisma.user.findUnique({
                    where: { id: newSession.user.id },
                    select: { username: true, createdAt: true, profilePicture: true },
                }) as UserWithProfilePicture;
                if(!user) {
                    return;
                }

                const name = newSession.user.name;

                await prisma.$transaction(async (tx) => {
                    // If username is not set or user was just created
                    if (!user.username) {
                        await tx.user.update({
                            where: { id: newSession.user.id },
                            data: {
                                username: `user_${newSession.user.id.substring(0, 8)}`
                            }
                        });
                    }
                    // If profile picture is not set, assign default profile picture
                    if (!user.profilePicture) {

                        const foregroundInitials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                        const profileBackgroundColors = ['primary', 'secondary', 'accent', 'info', 'success'];
                        const randomColor = profileBackgroundColors[Math.floor(Math.random() * profileBackgroundColors.length)];

                        await tx.userProfileImage.upsert({
                            where: { userId: newSession.user.id },
                            create: {
                                foregroundInitials: foregroundInitials,
                                backgroundColor: randomColor,
                                type: "DEFAULT",
                                userId: newSession.user.id,
                            },
                            update: {
                                foregroundInitials: foregroundInitials,
                                backgroundColor: randomColor,
                                type: "DEFAULT",
                            }
                        });
                    }
                }); 
            }
        }),
    }
});
export type TSession = typeof auth.$Infer.Session
export type TSessionUser = typeof auth.$Infer.Session.user