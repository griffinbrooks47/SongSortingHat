export default function ArtistPageLoading() {
  return (
    <main className="page w-full flex flex-col items-center mx-auto px-4">

      {/* Artist Data Skeleton */}
      <section className="relative w-full mt-12 sm:mt-16 md:mt-16 mb-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-0 animate-pulse">
        {/* Artist Image Skeleton */}
        <figure className="avatar">
          <div className="mask mask-squircle h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 bg-gray-300"></div>
        </figure>
        
        {/* Artist Info Skeleton */}
        <section className="w-full sm:w-auto sm:px-8 md:px-12 flex flex-col items-center sm:items-start">
          {/* Artist Name Skeleton */}
          <div className="mb-1 w-full">
            <div className="h-8 sm:h-10 md:h-12 w-[60%] max-w-xs sm:max-w-sm md:w-80 bg-gray-300 rounded mb-2 mx-auto sm:mx-0"></div>
          </div>
          
          {/* Artist Metadata Skeleton */}
          <div className="w-full flex flex-col items-center sm:items-start">
            <div className="h-4 sm:h-5 w-32 sm:w-36 md:w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 sm:h-4 w-24 sm:w-28 md:w-32 bg-gray-300 rounded mb-2"></div>
          </div>

          {/* Navigation Skeleton */}
          <ul className="w-full my-2 gap-2 flex justify-center sm:justify-start items-center">
            <li>
              <div className="h-10 sm:h-11 md:h-12 w-24 sm:w-26 md:w-28 bg-gray-300 rounded-sm"></div>
            </li>
            <li>
              <div className="h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12 bg-gray-300 rounded-full"></div>
            </li>
          </ul>

        </section>

      </section>
    </main>
  )
}