
import Link from 'next/link'

import "./globals.css";

import { SearchBar } from "./search/components/search";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  //

  return (
    <html lang="en" data-theme="cupcake">
      <body className="w-[100%] px-[1rem]">

          <nav className="flex justify-between items-center px-[0rem] h-[4rem] pt-[1rem]">

            <div>
              <Link href="/" className="mr-[1.5rem] ml-[1.5rem] cursor-pointer font-semibold">
                Song Sorting Hat
              </Link>
              <Link href='/search' className='mx-[1rem] cursor-pointer'>
                Explore
              </Link>
              <Link href="/tierlist" className='mx-[1rem] cursor-pointer'>
                Tierlists
              </Link>
            </div>

            <SearchBar placeholder="Search for artist..."></SearchBar>

            <div>
              <button className="btn btn-ghost mx-[0.25rem]">
                Sign Up
              </button>
              <button className="btn btn-neutral mx-[0.25rem]">
                Sign In
              </button>
            </div>
          </nav>
          {children}
      </body>
    </html>
  );
}
