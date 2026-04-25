export default function Loading() {
  return (
    <div className="flex-1 min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-[#2D5A27] dark:border-t-[#A8E6CF] rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
