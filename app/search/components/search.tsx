'use client'

import { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form";

import { useSearchParams, useRouter } from 'next/navigation';

import { IconSearch } from "@tabler/icons-react";

interface ArtistFormInput {
    searchString: string
}

export const SearchBar = ({ placeholder }: { placeholder: string }) => {

    const searchParams = useSearchParams();
    const { replace } = useRouter();
    
    /* Artist Search Function */
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
                    defaultValue={searchParams.get('query')?.toString()}
                    className="input input-bordered input-ghost input-md 
                        w-[30rem] h-[3rem] mb-[1rem] mt-[1rem] pl-[4rem] 
                        rounded-[0.75rem] text-[1rem] bg-base-300"
                />
                <button className="absolute left-[1rem] opacity-30">
                    <IconSearch className=""/>
                </button>
            </div>
        </form>
    )
}