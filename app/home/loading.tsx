import Navbar from "./components/secondaryNavbar";

import Feed from "./components/feed";
import SecondaryNavbar from "./components/secondaryNavbar";

export default function Loading() {
  return (
    <main className="page pb-12 relative bg-base-200 flex justify-center items-start">
      <section className="w-170 flex flex-col justify-center">
          <nav className="sticky top-[3.75rem] w-full z-10 bg-base-200">
              <SecondaryNavbar />
              <hr className="border-black opacity-10 w-full mx-auto mt-[7px]"></hr>
          </nav>
          <main className="relative pt-2 px-2">
            <Feed 
              sortings={[]}
            />
          </main>
      </section>
    </main>
  )
}