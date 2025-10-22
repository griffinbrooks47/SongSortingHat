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
                    className=" 
                            w-full h-11 mb-4 mt-4 pl-14 
                            rounded-md text-[1rem] bg-base-100 shadow-sm
                            focus:outline-none focus:ring-0 focus:border-transparent
                        "
                />
                <button className="absolute left-4 opacity-30">
                    <IconSearch className=""/>
                </button>
            </div>
        </form>
    )
}