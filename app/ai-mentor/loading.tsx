export default function AIMentorLoading() {
  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header skeleton */}
      <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 p-6 space-y-4 animate-pulse">
        <div className="flex gap-3 max-w-md">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex-1 border border-gray-100 dark:border-gray-800">
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="h-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse"></div>
      </div>
    </div>
  );
}
