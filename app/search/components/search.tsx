'use client'

import { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface ArtistFormInput {
    searchString: string
}

export const SearchBar = ({ placeholder }: { placeholder: string }) => {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    
    /* Artist Search Function */
    const { register, handleSubmit } = useForm<ArtistFormInput>()
    const onSubmit: SubmitHandler<ArtistFormInput> = (data) => {
        const params = new URLSearchParams(searchParams);
        params.set('artist', data.searchString);
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input 
                {...register("searchString")} 
                type="text" 
                placeholder={placeholder}
                defaultValue={searchParams.get('query')?.toString()}
                className="input input-bordered input-ghost input-md w-[40rem] mb-[1rem] mt-[1rem]"
            />
        </form>
    )
}