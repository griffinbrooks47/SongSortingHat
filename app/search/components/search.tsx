'use client'

import { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from 'next/navigation';
import { IconSearch } from "@tabler/icons-react";
import { Suspense } from "react";

interface ArtistFormInput {
    searchString: string
}

function SearchBarContent({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    
    const { register, handleSubmit } = useForm<ArtistFormInput>()
    const onSubmit: SubmitHandler<ArtistFormInput> = (data) => {
        const params = new URLSearchParams(searchParams);
        params.set('artist', data.searchString);
        replace(`/search?${params.toString()}`);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative flex items-center">
                <input 
                    {...register("searchString")} 
                    type="text" 
                    placeholder={placeholder}
                    defaultValue={searchParams.get('artist')?.toString() || ''}
                    className=" 
                            w-full h-11 mb-4 mt-4 
                            pl-10 pr-4 sm:pl-14
                            rounded-md text-sm sm:text-base bg-base-100 shadow-sm
                            focus:outline-none focus:ring-0 focus:border-transparent
                        "
                />
                <button 
                    type="submit" 
                    className="absolute left-3 sm:left-4 opacity-30"
                    aria-label="Search"
                >
                    <IconSearch className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>
        </form>
    )
}

export const SearchBar = ({ placeholder }: { placeholder: string }) => {
    return (
        <Suspense fallback={<div>Loading search...</div>}>
            <SearchBarContent placeholder={placeholder} />
        </Suspense>
    )
}