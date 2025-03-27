'use client'

import { IconWorld, IconUsers, IconUsersGroup } from "@tabler/icons-react";

import { useState } from "react";

export default function Navbar() {

    const directory: string[] = ["Global", "Friends", "Community"];

    /* Default page is global. */
    const [page, setPage] = useState<number>(0);

    return (
        <ul className="menu bg-base-100 rounded-md w-[18rem]">
            <div className="font-semibold ml-[0.5rem] text-[1rem] mt-[0.5rem] mb-[0.75rem]">Explore</div>
            <hr className="w-[95%] mx-auto"></hr>
            <li className="mt-[0.5rem]">
                <a className={`rounded-md ${page == 0 ? "bg-base-200" : ""}`}
                    onClick={() => {
                        setPage(0);
                    }}
                >
                    <IconWorld />
                    <div className="font-semibold">Global</div>
                </a>
            </li>
            <li className="mt-[0.5rem]">
                <a className={`rounded-md ${page == 1 ? "bg-base-200" : ""}`}
                    onClick={() => {
                        setPage(1);
                    }}
                >
                    <IconUsers />
                    <div className="font-semibold">Friends</div>
                </a>
            </li>
            <li className="mt-[0.5rem]">
                <a className={`rounded-md ${page == 2 ? "bg-base-200" : ""}`}
                    onClick={() => {
                        setPage(2);
                    }}
                >
                    <IconUsersGroup />
                    <div className="font-semibold">Community</div>
                </a>
            </li>
        </ul>
    )
}