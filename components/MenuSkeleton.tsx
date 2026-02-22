export function MenuSkeleton() {
  return (
    <div className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Hero Section Skeleton */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center bg-gray-100 px-6 py-3 rounded-full text-sm font-medium mb-6 animate-pulse">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <div className="w-32 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="h-16 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-2xl"></div>
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-xl"></div>
          </div>
          <div className="space-y-2 mb-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-3xl"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-2xl"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-xl"></div>
          </div>
          
          {/* Search and Filter Bar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-24 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Category Navigation Skeleton */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl px-8 py-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="w-20 h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Title Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-xs mb-4"></div>
          <div className="h-1 w-24 bg-gray-200 mx-auto mb-6 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-2xl"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-xl"></div>
          </div>
        </div>

        {/* Menu Items Grid Skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
            >
              <div className="h-72 bg-gray-200"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded mb-2 max-w-48"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded max-w-3/4"></div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-6 bg-gray-300 rounded"></div>
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                    <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 