export default function ProfileLoading() {
  return (
    <div className="flex-1 p-6 sm:p-8 max-w-4xl mx-auto w-full animate-pulse">
      {/* Avatar + name skeleton */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2"></div>
          <div className="h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-24"></div>
        ))}
      </div>

      {/* Certificates skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-48"></div>
    </div>
  );
}
