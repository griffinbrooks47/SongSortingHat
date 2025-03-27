
import Link from 'next/link'

import { SearchBar } from "./search/components/search";

import { IconLayoutGridRemove, IconListNumbers, IconSearch, IconUser, IconUserCircle, IconSitemap } from "@tabler/icons-react";

import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const isAuthenticated: boolean = true;

  return (
    <html lang="en" data-theme="cupcake">
      <body className="w-[100%] px-[0rem]">

          <nav className="flex justify-between items-center px-[1.5rem] h-[4rem] py-[0.5rem]">
            <div className='flex justify-center items-center ml-[1.5rem]'>
              <Link href="/" className="mr-[1.5rem] pb-[1px] cursor-pointer font-semibold">
                Song Sorting Hat
              </Link>
            </div>

            <SearchBar placeholder="Search for artist..."></SearchBar>

            {isAuthenticated && 
              <div className='flex justify-center items-center'>
                <Link href='/search' className='mx-[1.25rem] cursor-pointer font-semibold flex'>
                  <IconSitemap />
                  <p className='mx-[0.5rem]'>My Rankings</p>
                </Link>
                <button className='ml-[0.5rem] mr-[0.5rem] h-full opacity-90'>
                  <IconUserCircle className="pt-[0px]" height="2.5rem" width="2.5rem" />
                </button>
              </div>
            }
            {!isAuthenticated && 
              <div className='flex justify-center items-center'>
                <button className="btn btn-ghost mx-[0.5rem] rounded-md">
                  Sign Up
                </button>
                <button className="btn btn-neutral rounded-md">
                  Sign In
                </button>
              </div>
            }

          </nav>
          {children}
      </body>
    </html>
  );
}
