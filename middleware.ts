import { NextResponse, NextRequest } from 'next/server'

import { auth } from "@/lib/auth"; // your Better Auth instance
import { headers } from 'next/headers';

import { betterFetch } from "@better-fetch/fetch";

/* Define protected and public routes */
const protectedRoutes = ['/home']
const publicRoutes = ['/login', '/signup', '/']

/* Better Auth Sessions */
type Session = typeof auth.$Infer.Session;
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});
    
    // If user is logged in and visiting the root ("/"), send to /home
    if (session && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/home", request.nextUrl));
    }
  
    return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}