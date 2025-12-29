
/* Components */
import Navbar from "./components/nav";

import { Roboto_Flex, TikTok_Sans } from "next/font/google";

const roboto = TikTok_Sans({ subsets: ["latin"], weight: ["300", "400"] });

import './globals.css';

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
