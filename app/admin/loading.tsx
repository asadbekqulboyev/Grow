export default function AdminLoading() {
  return (
    <div className="flex-1 p-6 sm:p-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6"></div>
      
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="h-4 w-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
