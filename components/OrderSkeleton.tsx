export function OrderSkeleton() {
  return (
    <div className="pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="h-10 bg-gray-200 rounded mx-auto w-64 animate-pulse mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mx-auto w-80 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories and Menu Items - Left Side */}
          <div className="lg:col-span-2">
            {/* Category Navigation Skeleton */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 animate-pulse"
                >
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>

            {/* Category Header Skeleton */}
            <div className="mb-8">
              <div className="h-7 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
              
              {/* Menu Items List Skeleton */}
              <div className="grid gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col md:flex-row animate-pulse"
                  >
                    <div className="h-56 md:h-auto md:w-80 bg-gray-200"></div>
                    <div className="flex-1 p-6">
                      {/* Header with price */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-300 rounded mb-2 max-w-48"></div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="w-20 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-6 bg-gray-300 rounded mb-1"></div>
                          <div className="w-12 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded max-w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded max-w-1/2"></div>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 mb-6">
                        <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                <div className="p-6">
                  {/* Cart Items Skeleton */}
                  <div className="space-y-4 mb-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2 max-w-32"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 max-w-24"></div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded"></div>
                              <div className="w-6 h-4 bg-gray-200 rounded"></div>
                              <div className="w-6 h-6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-12 h-4 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <div className="w-12 h-5 bg-gray-300 rounded"></div>
                        <div className="w-16 h-5 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="w-full h-12 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 