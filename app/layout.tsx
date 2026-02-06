
/* Components */
import Navbar from "./components/nav";

import { Roboto_Flex, TikTok_Sans } from "next/font/google";

const global_font = TikTok_Sans({ subsets: ["latin"], display: 'swap', weight: ["400", "300","500", "600", "700", "800", "900"] });

import './globals.css';
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-theme="cupcake" className={`bg-base-200 ${global_font.className}`}>
      <body className="relative w-full px-0 min-h-screen">
        {children}
        <Navbar />
      </body>
    </html>
  );
}
