
import Navbar from "./components/nav";

import { IconListNumbers, IconLayoutGridRemove } from "@tabler/icons-react";

export default function Home() {

    /* TO INCLUDE: */
    // Artist search bar
    // Favorite artists
    // 


    return (
      <main className="relative bg-base-200 h-[calc(100vh-4rem)] flex justify-center pt-[1.5rem]">

        <section className="relative w-[45rem]">
            <nav className="absolute left-[-20rem] w-[18rem] flex flex-col items-center justify-center">
                <Navbar />
                <ul className="menu bg-base-100 rounded-md w-[18rem] mt-[0.5rem]">
                    <div className="font-semibold ml-[0.5rem] text-[1rem] mt-[0.5rem] mb-[0.75rem]">Create</div>
                    <hr className="w-[95%] mx-auto"></hr>
                    <li className="mt-[0.5rem]">
                        <a className="w-[full] rounded-md opacity-90 flex">
                            <IconListNumbers />
                            <p className="opacity-100 font-semibold">Make Ranking</p>
                        </a>
                    </li>
                    <li className="mt-[0.5rem]">
                        <a className="w-full rounded-md opacity-90 flex">
                            <IconLayoutGridRemove />
                            <p className="opacity-100 font-semibold">Make Tierlist</p>
                        </a>
                    </li>
                </ul>
            </nav>
            <nav className="h-[3rem] px-[1rem] rounded-md flex flex-row items-center">

            </nav>
        </section>


      </main>
    );
  }