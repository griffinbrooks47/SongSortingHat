'use client'

import { IconWorld, IconUsers, IconUsersGroup, IconCirclePlus, IconBoltFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function SecondaryNavbar() {
    const router = useRouter();

    const iconStyle = "h-[1.15rem]";

    /* Default page is global. */
    const [page, setPage] = useState<number>(0);

    const buttonStyle = "h-full px-3 mx-1 flex flex-row cursor-pointer justify-center items-center"

    return (
        <nav className="h-10 hidden md:flex flex-row justify-between items-center gap-2">
            {/* Left Section */}
            <section className="h-full flex">
                <ul className="bg-base-100 rounded-md flex flex-row py-1 shadow-sm">
                    <a className={`rounded-md ${page == 0 ? "bg-base-200" : ""} ${buttonStyle}`}
                        onClick={() => {
                            setPage(0);
                        }}
                    >
                        <IconWorld className={`${iconStyle}`} />
                        <div className="font-semibold mx-1">Global</div>
                    </a>
            

                    <a className={`rounded-md ${page == 1 ? "bg-base-200" : ""} ${buttonStyle}`}
                        onClick={() => {
                            //setPage(1);
                        }}
                    >
                        <IconUsers className={`${iconStyle}`} />
                        <div className="font-semibold mx-1">Following</div>
                    </a>
                </ul>
            </section>
            <button className={`btn btn-sm bg-accent border-neutral border-2 opacity-90 rounded-md shadow-sm`}
                onClick={() => {
                    router.push("/search");
                }}
            >
                <div className="font-semibold text-[0.9rem]">Create</div>
                <IconBoltFilled className="h-4 w-4 sm:ml-0" />
            </button>
        </nav>
    )
}