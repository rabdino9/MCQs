
import { fetchCategories } from '@/lib/data';
import { CategoryCard } from '@/components/CategoryCard';
// getIconForCategory is removed as icons will come from JSON
import { AlertTriangle, FolderSearch } from 'lucide-react';

export const revalidate = 3600; // Revalidate data every hour

export default async function HomePage() {
  const categories = await fetchCategories();

  if (!categories || !Array.isArray(categories)) {
    console.error("HomePage: categories data is critically invalid or undefined. Expected array, got:", categories);
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Categories</h1>
        <p className="text-muted-foreground">
          We encountered a critical issue loading the learning categories. Please try refreshing the page, or contact support if the problem persists.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">
        Explore Learning Categories
      </h1>
      
      {categories.length === 0 ? (
        <div className="text-center py-10">
          <FolderSearch className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No Learning Categories Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            It looks like there are no learning categories available at the moment. 
            This could be because the data source is empty or there was an issue fetching the data.
            Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.id} // Use category.id as key
              name={category.title} // Use category.title for display name
              iconUrl={category.icon} // Pass icon URL
              subcategoryCount={category.subcategories?.length || 0} 
              description={`Learn about various topics in ${category.title}.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
