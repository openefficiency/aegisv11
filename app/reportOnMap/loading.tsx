export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-lg">Loading map...</span>
    </div>
  );
}
