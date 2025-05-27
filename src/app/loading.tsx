
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Skeleton for the main title "Explore Learning Categories" */}
      <Skeleton className="h-10 w-3/4 sm:w-1/2 md:w-1/3 mx-auto mb-12" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col h-full">
            {/* Mimicking CardHeader */}
            <div className="flex flex-row items-center space-x-4 p-6 pb-2">
              <Skeleton className="h-10 w-10 rounded-full" /> {/* Icon */}
              <div className="space-y-1.5 flex-grow">
                <Skeleton className="h-6 w-3/4" /> {/* CardTitle */}
                <Skeleton className="h-4 w-full" /> {/* CardDescription (optional in real card) */}
              </div>
            </div>
            {/* Mimicking CardContent */}
            <div className="p-6 pt-0 flex-grow">
              <Skeleton className="h-4 w-1/2" /> {/* Subcategory count text */}
            </div>
            {/* Mimicking Button container div */}
            <div className="p-4 pt-0 mt-auto">
              <Skeleton className="h-10 w-full" /> {/* Button */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
