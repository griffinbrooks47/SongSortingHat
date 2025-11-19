import { SearchBar } from "./components/search";
import { SkeletonArtistCard } from "./components/artistCard";

export default function Loading() {
    return (
        <main className="mt-12 bg-base-200 min-h-[calc(100vh)] pt-20 flex justify-center items-center flex-col">
            <section className={`w-180 mt-0 mb-4`}>
                <SearchBar placeholder="Search for an artist..."/>
            </section>
            <section className="grid grid-cols-3 grid-rows-3 gap-4 rounded-none">
                {Array.from({ length: 9 }).map((_, index) => (
                    <SkeletonArtistCard key={index} />
                ))}
            </section>
        </main>
    )
}