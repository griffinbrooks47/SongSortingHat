

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Landing() {



  /* Get current user session if it exists. */
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if(session) {

  }

  return (
    <main className="h-[calc(100vh-5rem)]">
      

    </main>
  );
}
