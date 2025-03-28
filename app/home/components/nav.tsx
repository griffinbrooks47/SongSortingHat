'use client'

import { IconWorld, IconUsers, IconUsersGroup, IconCirclePlus } from "@tabler/icons-react";

import { ReactNode, useState } from "react";

export default function Navbar() {

    const directory: string[] = ["Global", "Friends", "Community"];
    const iconStyle = "h-[1.15rem]";

    /* Default page is global. */
    const [page, setPage] = useState<number>(0);

    return (
        <div className="flex flex-row justify-between">
            <ul className="menu menu-horizontal bg-base-100 rounded-sm shadow-sm">
                <li className="mr-[0.5rem]">
                    <a className={`rounded-md ${page == 0 ? "bg-base-200" : ""}`}
                        onClick={() => {
                            setPage(0);
                        }}
                    >
                        <IconWorld className={`${iconStyle}`} />
                        <div className="font-semibold">Global</div>
                    </a>
                </li>
                <li className="mr-[0.5rem]">
                    <a className={`rounded-md ${page == 1 ? "bg-base-200" : ""}`}
                        onClick={() => {
                            setPage(1);
                        }}
                    >
                        <IconUsers className={`${iconStyle}`} />
                        <div className="font-semibold">Friends</div>
                    </a>
                </li>
                <li className="mr-[0.5rem]">
                    <a className={`rounded-md ${page == 2 ? "bg-base-200" : ""}`}
                        onClick={() => {
                            setPage(2);
                        }}
                    >
                        <IconUsersGroup className={`${iconStyle}`} />
                        <div className="font-semibold">Community</div>
                    </a>
                </li>
            </ul>
            <div className="btn btn-primary btn-sm rounded-md my-auto shadow-sm">
                <IconCirclePlus className="h-[1.25rem] w-[1.25rem]" />
                Create
            </div>
        </div>
    )
}