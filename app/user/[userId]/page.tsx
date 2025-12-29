
/* Next / React */
import { headers } from "next/headers";

/* Auth */
import { auth } from "@/lib/auth";

/* Components */
import { UserProfile } from "./components/userProfile";
import { UserSortings } from "./components/sortingPreviewCard";

/* Prisma */
import { prisma } from "@/lib/db";

/* Types */
import { Prisma } from "@/prisma/generated/prisma/client";

const UserIncludeFollowersAndFollowing = {
    followers: true,
    following: true,
} satisfies Prisma.UserInclude;

export type UserWithFollowersAndFollowing = Prisma.UserGetPayload<{ include: typeof UserIncludeFollowersAndFollowing  }>;

const SortingIncludeArtistAndTracks = {
    tracks: true,
    artist: {
        include: {
            images: true,
        }
    },
} satisfies Prisma.DBSortingInclude;

export type SortingWithArtistAndTracks = Prisma.DBSortingGetPayload<{ include: typeof SortingIncludeArtistAndTracks  }>;

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    const userId = (await params).userId;
    const user: UserWithFollowersAndFollowing | null = await prisma.user.findUnique({
        where: { id: userId },
        include: UserIncludeFollowersAndFollowing,
    }); 
    
    if (!user) {
        return <div>User not found</div>;
    }

    const isFollowingUser: boolean = user.followers.some(follower => follower.id === (session?.user?.id || ""));

    const sortings: SortingWithArtistAndTracks[] = await prisma.dBSorting.findMany({
        where: { userId: userId },
        include: SortingIncludeArtistAndTracks,
    });

    return (
        <main className="page w-fit flex flex-col justify-center items-center mx-auto pb-16">

            {/* Profile Section */}
            <UserProfile 
                user={user}
                isFollowingInitial={isFollowingUser}
                isCurrUser={session?.user?.id === user.id}
            />

            {/* Favorite Artists */}

        
            {/* Sortings Section */}
            <UserSortings 
                sortings={sortings || []}
            />
            
        </main>
    )
}