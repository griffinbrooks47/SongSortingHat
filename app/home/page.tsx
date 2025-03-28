
import Navbar from "./components/nav";
import SampleFeed from "./components/sampleFeed";

export default function Home() {

    /* TO INCLUDE: */
    // Artist search bar
    // Favorite artists
    // 


    return (
      <main className="page relative bg-base-200 flex justify-center">

        <section className="w-[50rem] flex flex-col justify-center">
            <nav className="sticky top-[4rem] w-full z-10 bg-base-200 pt-[1rem]">
                <Navbar />
                <hr className="border-black opacity-10 w-[100%] mx-auto mt-[5px]"></hr>
            </nav>
            <main className="relative pt-[1rem]">
              <nav className="h-[3rem] rounded-md mb-[1rem]">
                <p className="font-bold text-[1.35rem]">{"Welcome back, [username]!"}</p>
                <p className="mb-[0.5rem] opacity-80">{"Here's what people are sorting..."}</p>
              </nav>
              <SampleFeed />
            </main>
        </section>


      </main>
    );
  }