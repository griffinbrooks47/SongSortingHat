'use client'

import { IconWorld, IconUsers, IconUsersGroup, IconCirclePlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function SecondaryNavbar() {
    const router = useRouter();

    const iconStyle = "h-[1.15rem]";

    /* Default page is global. */
    const [page, setPage] = useState<number>(0);

    const buttonStyle = "h-full px-3 mx-1 flex flex-row cursor-pointer justify-center items-center"

    return (
        <nav className="h-10 flex flex-row justify-between">
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
                        <div className="font-semibold mx-1">Friends</div>
                    </a>
                </ul>
            </section>
            <button className={`${buttonStyle} bg-accent border-neutral border-2 opacity-90 rounded-md shadow-sm`}
                onClick={() => {
                    router.push("/search");
                }}
            >
                <IconCirclePlus className="h-5 w-5" />
                <div className="font-semibold mx-1">Create</div>
            </button>
        </nav>
    )
}

/* 
<ul className="bg-base-100 rounded-md flex flex-row py-1 shadow-sm mx-1">
                    <a className={`rounded-md ${page == 2 ? "bg-base-200" : ""} ${buttonStyle}`}
                        onClick={() => {
                            //setPage(2);
                        }}
                    >
                        <IconUsersGroup className={`${iconStyle}`} />
                        <div className="font-semibold mx-1">Wiess</div>
                    </a>
                    <a className={`rounded-md ${page == 3 ? "bg-base-200" : ""} ${buttonStyle}`}
                        onClick={() => {
                            //setPage(3);
                        }}
                    >
                        <IconUsersGroup className={`${iconStyle}`} />
                        <div className="font-semibold mx-1">Rice</div>
                    </a>
                </ul>
*/