export default function PostSkeleton() {
  return (
    <div className="flex gap-3 p-4  w-full">
      {/* Profile picture skeleton */}
      <div className="flex-shrink-0">
        <div className="md:h-20 md:w-20 h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
      </div>

      <div className="flex-1">
        {/* Username and date skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-full w-1 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="mt-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Interaction buttons skeleton */}
        <div className="flex items-center mt-3">
          <div className="h-6 w-12 bg-gray-200 rounded mr-4 animate-pulse" />
          <div className="h-6 w-12 bg-gray-200 rounded mr-4 animate-pulse" />
          <div className="h-6 w-12 bg-gray-200 rounded mr-4 animate-pulse" />

          <div className="ml-auto">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
