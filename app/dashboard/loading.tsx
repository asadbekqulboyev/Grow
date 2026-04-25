export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 sm:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3"></div>
            <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1"></div>
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-64"></div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-64"></div>
      </div>
    </div>
  );
}
