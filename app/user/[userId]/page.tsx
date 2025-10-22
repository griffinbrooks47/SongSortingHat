
/* Next */
import Image from "next/image";
import Link from "next/link";

/* Types */
import { TSorting } from "@/types/sorting";
import { TUser } from "@/types/user";
import { Artist, Track } from "@/types/artist";

/* Prisma */
import prisma from "@/utils/prismaClient";
import { IconUser } from "@tabler/icons-react";
import { SortingCard } from "./components/sortingCard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export default async function UserProfile({
  params,
}: {
  params: Promise<{ userId: string }>
}) {

    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = (await params).userId;
    const isCurrUser = session?.user?.id === userId;

    const user: TUser | null = await prisma.getUser(userId);
    if (!user) {
        return <div>User not found</div>;
    }

    const username = user.username;
    const image: string = user.image;
    const favoriteArtists: Artist[] | undefined = user.favoriteArtists;
    const sortings: TSorting[] | undefined = user.sortings;

    return (
        <main className="page w-fit flex flex-col items-center mx-auto">
            {/* User Profile Header */}
            <section className="relative w-full mt-[4rem] mb-[2rem] flex flex-row justify-center items-center">
                {/* User Avatar */}
                <div className="avatar h-30 w-30">
                    <div className="p-4 ring-black ring-offset-base-100 bg-secondary w-full rounded-full ring-2 ring-offset-2">
                        <IconUser className="h-full w-full"/>
                    </div>
                </div>
                
                {/* User Info */}
                <section className="px-[3rem] flex flex-col justify-between items-start gap-4">
                    <div className="">
                        <div className="text-[2.25rem] m-0 font-bold leading-[3rem] line-clamp-2">
                            {user.name}
                        </div>
                        <div className="text-[1.25rem] text-gray-700 leading-[1.5rem] line-clamp-2">
                            @{user.username}
                        </div>
                    </div>
                    <nav className="flex flex-row gap-4">
                        {isCurrUser ? (
                            <button className="btn btn-sm btn-outline bg-primary btn-disabled border-2 rounded-md">
                                Edit Profile
                            </button>
                        ) : (
                            <button className="btn btn-sm btn-outline bg-primary btn-disabled border-2 rounded-md">
                                Follow
                            </button>
                        )}
                        
                    </nav>
                </section>
            </section>
        
            {/* Sortings Section */}
            <section className="mt-[4rem] flex flex-col items-start">
                <h1 className="text-xl font-bold">Sortings</h1>
                <hr className="border-black opacity-10 w-[50rem] mt-1"></hr>
                <div className="my-[1rem] grid grid-cols-4 gap-4">
                    {sortings && sortings.map((sorting) => (
                        <SortingCard 
                            key={sorting.artistId}
                            sorting={sorting}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}