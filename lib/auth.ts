
/* Auth */
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";

/* Prisma */
import { prisma } from "@/lib/db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true, 
    }, 
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    }, 
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const newSession = ctx.context.newSession;
            
            // Check if this is a newly created user
            if (newSession) {
                const user = await prisma.user.findUnique({
                    where: { id: newSession.user.id },
                    select: { username: true, createdAt: true }
                });
                
                // If username is not set or user was just created
                if (user && !user.username) {
                    await prisma.user.update({
                        where: { id: newSession.user.id },
                        data: {
                            username: `user_${newSession.user.id.substring(0, 8)}`
                        }
                    });
                }
            }
        }),
    }
});