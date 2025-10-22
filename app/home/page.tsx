
/* Components */
import Navbar from "./components/nav";
import SampleFeed from "./components/sampleFeed";
import Feed from "./components/feed";

/* Types */
import { TSorting } from "@/types/sorting";

/* Prisma */
import prisma from "@/utils/prismaClient";

export default async function Home() {

  /* TO INCLUDE: */
  // Artist search bar
  // Favorite artists
  // 



  const feedSortings: TSorting[] = await prisma.getGlobalSortings();



  return (
    <main className="min-h-[calc(100vh-4rem)] page relative bg-base-200 flex justify-center items-start">
      <section className="w-[50rem] flex flex-col justify-center">
          <nav className="sticky top-[4rem] w-full z-10 bg-base-200 pt-[1rem]">
              <Navbar />
              <hr className="border-black opacity-10 w-[100%] mx-auto mt-[5px]"></hr>
          </nav>
          <main className="relative pt-[1rem]">
            <nav className="h-[3rem] rounded-md mb-[1.5rem]">
              <p className="font-bold text-[1.35rem]">{"Welcome back!"}</p>
              <p className="mb-[0.5rem] opacity-80">{"Here's what people are sorting..."}</p>
            </nav>
            <Feed 
              sortings={feedSortings}
            />
          </main>
      </section>


    </main>
  );
}