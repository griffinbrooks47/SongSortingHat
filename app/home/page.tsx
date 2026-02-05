/* Components */
import SecondaryNavbar from "./components/secondaryNavbar";
import Feed from "./components/feed";

/* Types */
import { Prisma } from "@/prisma/generated/prisma/client";

/* Prisma */
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

const trackInclude = {
  album: {
    include: {
      images: true,
    },
  },
  artists: {
    include: {
      artist: true,
    },
  },
} satisfies Prisma.TrackInclude;
export type TrackWithArtistsAndImages = Prisma.TrackGetPayload<{ include: typeof trackInclude  }>;

const sortingInclude = {
  artist: true,
  tracks: {
    include: {
      track: {
        include: trackInclude
      },
    }
  },
  user: {
    include: {
      profilePicture: true,
    }
  },
} satisfies Prisma.SortingInclude;

export type SortingWithUserArtistAndTracks = Prisma.SortingGetPayload<{ include: typeof sortingInclude  }>;

/* Cache home feed to reduce database load */
const getCachedSortings = unstable_cache(
  async () => {
    return await prisma.sorting.findMany({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
      include: sortingInclude,
    });
  },
  ['global-sortings'],
  {
    revalidate: 60,
    tags: ['sortings']
  }
);

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if (!session) {
    redirect('/login');
  }

  const feedSortings: SortingWithUserArtistAndTracks[] = await getCachedSortings();

  return (
    <main className="page pb-12 relative bg-base-200 flex justify-center items-start">
      <section className="w-full lg:w-170 flex flex-col justify-center">
          <nav className="sticky top-[4rem] w-full z-10 bg-base-200">
              <SecondaryNavbar />
              <hr className="border-black opacity-10 w-full mx-auto mt-[0px] lg:mt-[7px]"></hr>
          </nav>
          <main className="relative pt-2 px-2">
            <Feed sortings={feedSortings}></Feed>
          </main>
      </section>
    </main>
  );
}