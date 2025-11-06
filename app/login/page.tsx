'use client'

import Image from "next/image"

/* Auth Imports */
import { signIn } from '@/lib/auth-client'

/* Icons */
import { IconAt, IconKey } from "@tabler/icons-react"

export default function Login() {

    /* Log In */
    const handleLogin = async () => {
        await signIn.email({
            email: "user@example.com",
            password: "password123",
        });
    };

    /* 3rd Party Sign-In */
    const handleGoogleRegister = async () => {
        await signIn.social({
            provider: "google",
        });
    }

    return (
        <main className="h-[calc(100vh-4rem)] pt-4 flex justify-center items-base">

            {/* Log In Container */}
            <div className="w-[27.5rem] h-fit px-10 mt-[2rem] py-10 bg-base-200 border-0 border-black shadow-0 rounded-lg flex justify-base items-center flex-col">
                <figure className='my-[0rem] h-30 w-30'>
                    <Image
                        src="/ssh_logo.png"
                        alt="Song Sorting Hat Logo"
                        width={500}
                        height={500}
                        className=""
                        priority
                    >
                    </Image>
                </figure>
                <h1 className="text-[1.5rem] font-bold mr-auto">Login</h1>
                <div className='text-[0.85rem] mr-auto'>
                    New user? <a href="/signup" className="mx-1 text-blue-black font-bold hover:underline">Create an account</a>
                </div>

                {/* Username / Password */}
                <section className='mt-4 mb-2 w-full flex flex-col justify-center items-center gap-3'>
                    <label className="input validator input-ghost bg-base-300 w-full rounded-sm">
                        <IconAt className="mr-1" />
                        <input
                            type="text"
                            required
                            placeholder="Username"
                            pattern="[A-Za-z][A-Za-z0-9\-]*"
                            minLength={3}
                            maxLength={30}
                            title="Only letters, numbers or dash"
                        />
                    </label>
                    <label className="input validator input-ghost bg-base-300 w-full rounded-sm">
                        <IconKey className="mr-1" />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                        />
                    </label>
                   
                </section>
                <div className='text-[0.85rem] mr-auto'>
                    <a href="/register" className="mx-1 text-blue-black font-bold hover:underline">Forgot password?</a>
                </div>

                {/* Social Sign On */}
                <div className="flex flex-col justify-center items-center gap-2 w-full mt-4">
                    <button className="w-full btn bg-accent text-black border-black rounded-sm"
                        onClick={() => handleGoogleRegister()}
                    >
                        Log In
                    </button>
                    <div className="divider">or</div>
                    <button className="btn bg-white text-black border-black border-2 rounded-sm w-full"
                        onClick={() => handleGoogleRegister()}
                    >
                        <svg aria-label="Google logo" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        Continue with Google
                    </button>
                    
                </div>
            </div>

        </main>
    )
}

/* 
<button className="btn bg-black btn-disabled text-black text-white border-black rounded-sm w-full"
                        onClick={() => handleSpotifyRegister()}
                    >
                        <svg aria-label="Apple logo" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195"><path fill="white" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z"></path></svg>
                        <p className='pl-1 pr-2'>Continue with Apple</p>
                    </button>
                    <button className="btn bg-success disabled text-black border-black rounded-sm w-full"
                        onClick={() => handleSpotifyRegister()}
                    >
                        <IconBrandSpotifyFilled className="mr-1" />
                        Continue with Spotify
                    </button>
*/

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