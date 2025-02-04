export default function Dashboard() {

    /* TO INCLUDE: */
    // Artist search bar
    // Favorite artists
    // 


    return (
      <main className="bg-red-100 h-[calc(100vh-5rem)]">
        <div className="bg-green-100 h-[3rem]">
            Top Section
        </div>
        <div className="search-bar-container flex justify-center h-[2.25rem]">
            <div className="search-bar w-[50%]">
                <input className="w-[100%] h-[100%] rounded-full"></input>
            </div>
        </div>
        <div className="favorites flex justify-center items-center h-[18rem] my-[1rem] bg-purple-100">
            Favorites
        </div>
        <div className="top-artists flex justify-center items-center h-[18rem] my-[1rem] bg-purple-100">
            Top Artists
        </div>
      </main>
    );
  }