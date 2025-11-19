import Navbar from "./components/nav";

import { SkeletonFeed } from "./components/feed";

export default function Loading() {
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
            <SkeletonFeed />
            </main>
        </section>
    </main>
  )
}