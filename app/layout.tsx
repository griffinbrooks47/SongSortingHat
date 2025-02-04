import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  //

  return (
    <html lang="en" data-theme="cupcake">
      <body className="w-[95%] mx-auto">

          <nav className="flex justify-between items-center px-[0rem] h-[4rem] pt-[1rem]">

            <div>
          
              <a className="mr-[0.5rem] ml-[0.5rem] cursor-pointer font-semibold" href="">Song Sorting Hat</a>

            </div>

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
