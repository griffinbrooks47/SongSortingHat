'use client'

import { useRouter } from "next/navigation";

import { useAuthState } from "@/hooks/useAuthState";

import { signUp, signIn } from '@/lib/auth-client'

/* React form imports */
import { useForm } from "react-hook-form";

type Inputs = {
    username: string
    email: string
    password: string
}

export default function Register() {

    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error, success, loading, setLoading, setError, setSuccess, resetState } = useAuthState();

    const {
        register,
        handleSubmit,
    } = useForm<Inputs>()

    /* Generic register with email & password */
    const onSubmit = async (formInput: Inputs) => {
        try {
            await signUp.email({
                name: formInput.username,
                email: formInput.email,
                password: formInput.password,
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("User has been created")
                    router.replace('/')
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                },
            });
        } catch (error) {
            console.error(error)
            setError("Something went wrong")
        }
    }

    /* Google Account Register */
    const handleGoogleRegister = async () => {
        await signIn.social({
            provider: "google",
        });
    }

    return (
        <main className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <div className="flex justify-base items-center flex-col w-[25rem] h-[35rem] rounded-[1rem] pt-[2.5rem] bg-gray">
                <p className="text-[2.75rem] font-semibold">Register</p>
                <p className="mb-[1.5rem]">Start ranking by signing into your account!</p>
                 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-[100%] mb-[0.5rem]">
                    <input {...register("username")} type="text" placeholder="Username" className="input input-bordered w-full my-[0.25rem]" />
                    <input {...register("email")} type="text" placeholder="Email" className="input input-bordered w-full my-[0.25rem]" />
                    <input {...register("password")} type="text" placeholder="Password" className="input input-bordered w-full my-[0.25rem]" />
                    <input type="submit" className="btn mx-auto" />
                </form>
                <div className="divider">or</div>
                <div className="flex justify-center items-center w-full">
                    <button className="btn px-[1rem] mx-[0.5rem]"
                        onClick={() => handleGoogleRegister()}
                    >
                        Login with Google
                    </button>
                </div>
            </div>
        </main>
    )
}