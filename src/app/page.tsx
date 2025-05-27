
import { fetchCategories } from '@/lib/data';
import { CategoryCard } from '@/components/CategoryCard';
import { getIconForCategory } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600; // Revalidate data every hour

export default async function HomePage() {
  const categories = await fetchCategories();

  // Defensive check in case fetchCategories unexpectedly returns undefined, null, or not an array
  if (!categories || !Array.isArray(categories)) {
    console.error("HomePage: categories data is invalid (undefined, null, or not an array).", categories);
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Categories</h1>
        <p className="text-muted-foreground">We encountered an issue loading the learning categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">
        Explore Learning Categories
      </h1>
      {categories.length === 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <CategoryCard
            key={category.categoryName}
            name={category.categoryName}
            Icon={getIconForCategory(category.categoryName)}
            subcategoryCount={category.subcategories?.length || 0} // Added safety for subcategories
            description={`Learn about various topics in ${category.categoryName}.`}
          />
        ))}
      </div>
    </div>
  );
}
