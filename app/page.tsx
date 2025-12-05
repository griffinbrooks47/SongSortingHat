/* Auth */
import { useSession } from "@/lib/auth-client"

/* Next */
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Caveat } from 'next/font/google';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { IconArrowNarrowRight } from "@tabler/icons-react";

const caveat = Caveat({ subsets: ['latin'], weight: '400' });

export default async function Landing() {  

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session) {
    redirect('/home');
  }

  return (
    <main className="page pt-[5rem] flex flex-col justify-center items-center text-center px-4">
      
      {/* Logo */}
      <figure className="mb-2">
        <Image
          src="/ssh_logo.png"
          alt="Logo"
          height={150}
          width={150}
          className="mb-[-10px] ml-1 h-38 w-38 sm:h-38 sm:w-38 md:h-40 md:w-40 lg:h-48 lg:w-48 object-contain"
        />
      </figure>

      {/* Headline */}
      <section className="flex flex-col justify-center items-center leading-tight">
        <h1 className="font-thin text-4xl sm:text-4xl md:text-7xl lg:text-7xl">
          your music taste
        </h1>

        <h1 className={`${caveat.className} font-bold pr-1 text-5xl sm:text-6xl md:text-7xl lg:text-7xl`}>
          Centralized.
        </h1>
      </section>

      {/* Get Started */}
      <section className="mt-6 mb-24">
        <Link 
          href="/signup" 
          className="btn btn-neutral rounded-full font-bold flex items-center gap-2 px-6 py-2 btn-md sm:btn-md sm:px-8 sm:py-2 text-md sm:text-xl lg:btn-lg"
        >
          Get Started
          <IconArrowNarrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>
      </section>

      {/* Future Sorting Carousel Placeholder */}
      <section></section>

    </main>
  );
}
