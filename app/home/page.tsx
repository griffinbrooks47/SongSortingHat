
/* Components */
import Navbar from "./components/nav";
import { Feed } from "./components/feed";

/* Types */
import { TSorting } from "@/types/sorting";

/* Prisma */
import prisma from "@/utils/prismaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function Home() {

  const feedSortings: TSorting[] = await prisma.getGlobalSortings();

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-12 page relative bg-base-200 flex justify-center items-start">
      <section className="w-200 flex flex-col justify-center">
          <nav className="sticky top-16 w-full z-10 bg-base-200 pt-4">
              <Navbar />
              <hr className="border-black opacity-10 w-full mx-auto mt-[5px]"></hr>
          </nav>
          <main className="relative pt-4">
            <nav className="h-12 rounded-md mb-0">
              <p className="mb-2 opacity-80">{"Here's what people are sorting..."}</p>
            </nav>
            <Feed 
              sortings={feedSortings}
            />
          </main>
      </section>


    </main>
  );
}