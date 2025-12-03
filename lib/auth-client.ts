import {
    createAuthClient
} from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
})

export type TSession = typeof authClient.$Infer.Session

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;