'use client'

import { useSearchParams } from 'next/navigation'

import { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form";

interface ArtistFormInput {
    searchString: string
}
export default function Explore() {

    const { register, handleSubmit } = useForm<ArtistFormInput>()
    const onSubmit: SubmitHandler<ArtistFormInput> = async (data) => {

    }

    return (
        <main className="flex justify-center items-center flex-col">
            <p className="mt-[7.5rem]">Logo</p>
            <p className="text-[2rem] font-semibold">Explore Artists</p>
            <p>Subtext</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input 
                    {...register("searchString")} 
                    type="text" 
                    placeholder="Search for an artist..." 
                    className="input input-bordered input-ghost input-md w-[40rem] mb-[0.5rem] mt-[1rem]"
                />
            </form>
            <section className="favorites w-[70%] mt-[0.5rem]">
                <p>My Favorites</p>
                <div>

                </div>
            </section>
            <div>
            
            </div>
        </main>
    )
}