

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Landing() {


  redirect('/home');
  

  return (
    <main className="h-[calc(100vh-5rem)]">
      

    </main>
  );
}
