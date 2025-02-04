


export default function Dashboard() {

    return (
        <main className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <div className="flex justify-base items-center flex-col w-[25rem] h-[35rem] rounded-[1rem] pt-[2.5rem] bg-gray">
                <p className="text-[2.75rem] font-semibold">Welcome back!</p>
                <p className="mb-[1.5rem]">Start ranking by signing into your account!</p>
                <input type="text" placeholder="Email" className="input input-bordered w-full my-[0.25rem]" />
                <input type="text" placeholder="Password" className="input input-bordered w-full my-[0.25rem]" />
                <a className="flex justify-end mb-[0.5rem] mt-[0.25rem] font-semibold text-[0.90rem]">Forgot Password?</a>
                <div className="divider">or</div>
                <div className="flex justify-center items-center w-full">
                    <button className="btn px-[1rem] mx-[0.5rem]">Login with Google</button>
                    <button className="btn px-[1rem] mx-[0.5rem]">Login with Spotify</button>
                </div>
            </div>
        </main>
    )
}