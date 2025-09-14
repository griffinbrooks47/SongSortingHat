
import "./globals.css";

/* Components */
import Navbar from "./components/nav";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-theme="cupcake" className='bg-base-200'>
      <body className="relative w-[100%] px-[0rem] min-h-screen">
        {children}
        <Navbar />
      </body>
    </html>
  );
}
