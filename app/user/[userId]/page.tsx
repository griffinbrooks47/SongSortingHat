
/* Next / React */
import { headers } from "next/headers";

/* Auth */
import { auth, TSessionUser } from "@/lib/auth";

/* Components */
import { UserProfile } from "./components/userProfile";
import { UserSortings } from "./components/sortingPreviewCard";

/* Prisma */
import { prisma } from "@/lib/db";

/* Types */
import { Prisma } from "@/prisma/generated/prisma/client";

const UserIncludeFollowersAndFollowing = {
    profilePicture: true,
} satisfies Prisma.UserInclude;
export type UserWithRelations = Prisma.UserGetPayload<{ include: typeof UserIncludeFollowersAndFollowing  }>;

const SortingIncludeArtistAndTracks = {
    tracks: true,
    artist: {
        include: {
            images: true,
        }
    },
} satisfies Prisma.SortingInclude;
export type SortingWithRelations = Prisma.SortingGetPayload<{ include: typeof SortingIncludeArtistAndTracks  }>;

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if(!session?.user) {
        return <div>Please log in to view user profiles</div>;
    }

    const sessionUserId = session.user.id;
    const sessionUser: TSessionUser = session.user;
    
    const profileUserId = (await params).userId;
    const profileUser: UserWithRelations | null = await prisma.user.findUnique({
        where: { id: profileUserId },
        include: UserIncludeFollowersAndFollowing,
    });
    if (!profileUser) {
        return <div>User not found</div>;
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerUserId_followingUserId: {
                followerUserId: sessionUserId,
                followingUserId: profileUserId,
            },
        },
    });
    const isFollowingInitial = !!existingFollow;

    const sortings: SortingWithRelations[] = await prisma.sorting.findMany({
        where: { userId: profileUserId },
        include: SortingIncludeArtistAndTracks,
    });

    return (
        <main className="page w-fit flex flex-col justify-center items-center mx-auto pb-16">

            {/* Profile Section */}
            <UserProfile 
                sessionUser={sessionUser}
                profileUser={profileUser}
                isFollowingInitial={isFollowingInitial}
             />

            {/* Favorite Artists */}

        
            {/* Sortings Section */}
            <UserSortings 
                sortings={sortings || []}
            />
            
        </main>
    )
}