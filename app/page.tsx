
/* Auth */
import { useSession } from "@/lib/auth-client"

/* Next */
import { redirect } from "next/navigation";
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
    <main className={`h-[calc(100vh-5rem)] pt-[5rem] flex flex-col justify-center items-center`}>
      {/* Header */}
      <figure>
        <Image
          src="/ssh_logo.png"
          alt="Logo"
          height={150}
          width={150}
          className="mb-0 ml-1"
        >

        </Image>
      </figure>
      <section className="flex flex-col justify-center items-center">
        <h1 className="text-7xl font-thin">your music taste</h1>
        <h1 className={`text-7xl font-bold pr-2 ${caveat.className}`}>Centralized.</h1>
      </section>
      {/* Get Started Section */}
      <section className="mt-7 mb-24">
        <button className="px-6 btn btn-neutral btn-lg rounded-full font-bold">
          Get Started
          <IconArrowNarrowRight className="h-6" />
        </button>
      </section>
      {/* Sorting Carousel */}
      <section>

      </section>

    </main>
  );
}