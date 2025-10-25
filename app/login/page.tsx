'use client'

/* Auth Imports */
import { signIn } from '@/lib/auth-client'

/* Icons */
import { IconBrandGoogleFilled, IconBrandSpotifyFilled } from "@tabler/icons-react"

export default function Login() {

    /* 3rd Party Sign-In */
    const handleGoogleRegister = async () => {
        await signIn.social({
            provider: "google",
        });
    }
    const handleSpotifyRegister = async () => {
        await signIn.social({
            provider: "spotify",
        });
    }

    return (
        <main className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <div className="flex justify-base items-center flex-col w-100 h-140 rounded-2xl pt-10 bg-gray">
                <p className="text-[2.25rem] font-semibold mr-auto">Login.</p>
                <div className="flex flex-col justify-center items-center w-full">
                    <button className="btn bg-white text-black border-[#e5e5e5] rounded-md w-full my-2"
                        onClick={() => handleGoogleRegister()}
                    >
                        <IconBrandGoogleFilled className="mr-1" />
                        Login with Google
                    </button>
                </div>
            </div>
        </main>
    )
}

/* 
<button className="btn bg-white text-black border-[#e5e5e5] rounded-md w-full my-2"
                        onClick={() => handleSpotifyRegister()}
                    >
                        <IconBrandSpotifyFilled className="mr-1" />
                        Login with Spotify
                    </button>

*/

/* 
<div className="divider">or</div>
                <input type="text" placeholder="Email" className="input input-bordered w-full my-2 rounded-md" />
                <input type="text" placeholder="Password" className="input input-bordered w-full my-2 rounded-md" />
                <a className="flex justify-end mb-2 mt-1 ml-auto font-semibold text-[0.8rem]">Forgot Password?</a>
                <button className="btn btn-accent my-2 rounded-md w-full">Login</button>`
*/