
import "./globals.css";

/* Auth */
import { auth } from "@/lib/auth";

/* Next */
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/* Components */
import Navbar from "./components/nav";

import { Roboto_Flex } from "next/font/google";

const roboto = Roboto_Flex({ subsets: ["latin"], weight: ["100", "400"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-theme="cupcake" className={`bg-base-200 ${roboto.className}`}>
      <body className="relative w-full px-0 min-h-screen">
        {children}
        <Navbar />
      </body>
    </html>
  );
}
