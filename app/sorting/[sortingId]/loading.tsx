export default function Loading() {
    return (
        <main className="min-h-[calc(100vh-4rem)] w-full pt-8 sm:pt-10 md:pt-16 mb-8 flex flex-col items-center px-4 sm:px-6">
            {/* Artist Header Skeleton */}
            <section className="relative w-full mt-12 sm:mt-12 md:mt-16 mb-4 sm:mb-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-0 animate-pulse">
                {/* Artist Image Skeleton */}
                <figure className="avatar">
                    <div className="mask mask-squircle h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 bg-gray-300"></div>
                </figure>

                {/* Artist Info Skeleton */}
                <section className="w-full sm:w-auto sm:px-8 md:px-12 flex flex-col items-center sm:items-start text-center sm:text-left">
                    {/* Artist Name Skeleton */}
                    <div className="mb-1 w-full max-w-xs sm:max-w-md md:max-w-none">
                        <div className="h-7 sm:h-9 md:h-12 w-48 sm:w-64 md:w-80 bg-gray-300 rounded mx-auto sm:mx-0"></div>
                    </div>
                    
                    {/* Sorting By Skeleton */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded"></div>
                        <div className="h-5 sm:h-6 md:h-6 w-24 sm:w-28 bg-gray-300 rounded"></div>
                    </div>
                    
                    {/* Username Skeleton */}
                    <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-300 rounded mt-1"></div>
                    
                    {/* Track Count Skeleton */}
                    <div className="h-3 sm:h-3 md:h-4 w-16 sm:w-20 bg-gray-300 rounded mt-1"></div>
                </section>
            </section>

            <hr className="border-gray-300 opacity-30 w-full max-w-3xl sm:max-w-4xl md:w-200 mx-auto"></hr>

            {/* Sorted Tracks List Skeleton */}
            <section className="flex flex-col items-center gap-2 sm:gap-3 pb-8 mt-6 sm:mt-8 w-full max-w-3xl sm:max-w-4xl md:max-w-none px-2 sm:px-0 animate-pulse">
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 sm:gap-3 w-full"
                    >
                        {/* Rank Number Skeleton */}
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 shrink-0"></div>
                        
                        {/* Song Card Skeleton */}
                        <div className="relative h-16 sm:h-18 md:h-20 w-[90%] mx-auto sm:w-140 shrink-0 rounded-md border-2 border-gray-200 bg-base-100 overflow-hidden flex flex-row gap-2 p-1">
                            {/* Album Cover Skeleton */}
                            <div className="h-full aspect-square rounded-sm shrink-0 bg-gray-300"></div>

                            {/* Track Info Skeleton */}
                            <div className="flex flex-col justify-center flex-1 min-w-0 gap-1.5 pr-1">
                                {/* Track Title Skeleton */}
                                <div className="h-3 sm:h-4 md:h-5 w-3/4 bg-gray-300 rounded"></div>
                                {/* Artist Name Skeleton */}
                                <div className="h-2.5 sm:h-3 md:h-3.5 w-1/2 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}