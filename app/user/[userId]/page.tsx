
/* Next */
import Image from "next/image";
import Link from "next/link";

/* Components */
import UserProfile from "./components/userProfile";

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
import { User } from "lucide-react";


export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {

    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const userId = (await params).userId;
    const user: TUser | null = await prisma.getUser(userId);
    
    /* Check if user exists. */
    if (!user) {
        return <div>User not found</div>;
    }

    const sortings: TSorting[] | undefined = user.sortings;

    return (
        <main className="page w-fit flex flex-col justify-center items-center mx-auto pb-16">

            {/* Profile Section */}
            <UserProfile 
                user={user}
                currUserId={session?.user?.id || ""}
            />
        
            {/* Sortings Section */}
            <section className="mt-16 flex flex-col items-start">
                <h1 className="text-xl font-bold">Sortings</h1>
                <hr className="border-black opacity-10 w-200 mt-1"></hr>
                <div className="my-4 grid grid-cols-4 gap-4">
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