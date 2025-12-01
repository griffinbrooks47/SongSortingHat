/* Components */
import SecondaryNavbar from "./components/secondaryNavbar";
import Feed from "./components/feed2";

/* Types */
import { TSorting } from "@/types/sorting";

/* Prisma */
import prisma from "@/utils/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

export const revalidate = 60;

const getCachedSortings = unstable_cache(
  async () => {
    return await prisma.getGlobalSortings();
  },
  ['global-sortings'], // Cache key
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['sortings'] // Tag for on-demand revalidation
  }
);

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if (!session) {
    redirect('/');
  }

  const feedSortings: TSorting[] = await getCachedSortings();

  return (
    <main className="page pb-12 relative bg-base-200 flex justify-center items-start">
      <section className="w-170 flex flex-col justify-center">
          <nav className="sticky top-[3.75rem] w-full z-10 bg-base-200">
              <SecondaryNavbar />
              <hr className="border-black opacity-10 w-full mx-auto mt-[7px]"></hr>
          </nav>
          <main className="relative pt-4 px-2">
            <Feed 
              sortings={feedSortings}
            />
          </main>
      </section>
    </main>
  );
}