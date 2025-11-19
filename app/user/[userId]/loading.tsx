
import { SkeletonUserProfile } from "./components/userProfile"

export default function Loading() {
    return (
        <main className="page w-fit flex flex-col justify-center items-center mx-auto pb-16">

            {/* Profile Section */}
            <SkeletonUserProfile />

            {/* Sortings Section */}
            <section className="mb-auto flex flex-col items-start">
            </section>
        </main>
    )
}