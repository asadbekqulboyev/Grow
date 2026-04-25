export default function CoursesLoading() {
  return (
    <div className="flex-1 p-6 sm:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2"></div>
        <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8"></div>

      {/* Course cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="h-40 bg-gray-200 dark:bg-gray-800"></div>
            <div className="p-5">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-[#A8E6CF]/30 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
