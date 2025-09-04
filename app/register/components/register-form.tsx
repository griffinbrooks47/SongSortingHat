'use client'

import { useForm } from "react-hook-form";

type Inputs = {
    username: string
    email: string
    password: string
}

export function RegisterForm(props: { onSubmit: (data: { username: string; email: string; password: string }) => void }) {

    const {
        register,
        handleSubmit,
    } = useForm<Inputs>()

    return (
        <form onSubmit={handleSubmit(props.onSubmit)}>
            <input {...register("username")} type="text" placeholder="Username" className="input input-bordered w-full my-[0.25rem]" />
            <input {...register("email")} type="text" placeholder="Email" className="input input-bordered w-full my-[0.25rem]" />
            <input {...register("password")} type="text" placeholder="Password" className="input input-bordered w-full my-[0.25rem]" />
            <input type="submit" />
        </form>
    )
}