export default function ArtistPageLoading() {
  return (
    <main className="page w-fit flex flex-col items-center mx-auto">

      {/* Artist Data Skeleton */}
      <section className="relative w-full mt-16 mb-8 flex flex-row justify-center items-center animate-pulse">
        {/* Artist Image Skeleton */}
        <figure className="avatar">
          <div className="mask mask-squircle h-44 w-44 bg-gray-300"></div>
        </figure>
        
        {/* Artist Info Skeleton */}
        <section className="px-12">
          {/* Artist Name Skeleton */}
          <div className="mb-1">
            <div className="h-12 w-80 bg-gray-300 rounded mb-2"></div>
          </div>
          
          {/* Artist Metadata Skeleton */}
          <div className="">
            <div className="h-5 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          </div>

          {/* Navigation Skeleton */}
          <ul className="w-full my-2 gap-2 flex justify-start items-center">
            <li>
              <div className="h-12 w-28 bg-gray-300 rounded-sm"></div>
            </li>
            <li>
              <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
            </li>
          </ul>

        </section>

      </section>
    </main>
  )
}
