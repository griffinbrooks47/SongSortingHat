'use client'

/* Auth Imports */
import { signIn } from '@/lib/auth-client'

/* Icons */
import { IconBrandGoogleFilled, IconBrandSpotifyFilled } from "@tabler/icons-react"

export default function Login() {

    /* Google Account Register */
    const handleGoogleRegister = async () => {
        await signIn.social({
            provider: "google",
        });
    }

    return (
        <main className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <div className="flex justify-base items-center flex-col w-[25rem] h-[35rem] rounded-[1rem] pt-[2.5rem] bg-gray">
                <p className="text-[2.25rem] font-semibold mr-auto">Login.</p>
                <div className="flex flex-col justify-center items-center w-full">
                    <button className="btn bg-white text-black border-[#e5e5e5] rounded-md w-full my-[0.5rem]"
                        onClick={() => handleGoogleRegister()}
                    >
                        <IconBrandGoogleFilled className="mr-[0.25rem]" />
                        Login with Google
                    </button>
                    <button className="btn bg-white text-black border-[#e5e5e5] rounded-md w-full my-[0.5rem]">
                        <IconBrandSpotifyFilled className="mr-[0.25rem]" />
                        Login with Spotify
                    </button>
                    
                </div>
            </div>
        </main>
    )
}

/* 
<div className="divider">or</div>
                <input type="text" placeholder="Email" className="input input-bordered w-full my-[0.5rem] rounded-md" />
                <input type="text" placeholder="Password" className="input input-bordered w-full my-[0.5rem] rounded-md" />
                <a className="flex justify-end mb-[0.5rem] mt-[0.25rem] ml-auto font-semibold text-[0.8rem]">Forgot Password?</a>
                <button className="btn btn-accent my-[0.5rem] rounded-md w-full">Login</button>`
*/