
import { fetchCategories } from '@/lib/data';
import { CategoryCard } from '@/components/CategoryCard';
import { AlertTriangle, FolderSearch } from 'lucide-react';
import type { FetchedCategoryDetail, Category as AppCategory } from '@/lib/types'; // Import FetchedCategoryDetail and rename Category to avoid conflict

export const revalidate = 3600; // Revalidate data every hour

// Extend Category type for internal use in this component to store the fetched count
interface CategoryWithDisplayCount extends AppCategory {
  displaySubcategoryCount: number;
}

export default async function HomePage() {
  const baseCategories = await fetchCategories();

  if (!baseCategories || !Array.isArray(baseCategories)) {
    console.error("HomePage: categories data is critically invalid or undefined. Expected array, got:", baseCategories);
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

  if (baseCategories.length === 0) {
    console.warn("HomePage: fetchCategories returned an empty array. This will result in the 'No Learning Categories Found' message. Please check the data source (CATEGORIES_JSON_URL) for content and validity (e.g., ensure it's valid JSON, check for issues like trailing commas). Also, review server logs for specific fetch/parse errors.");
  }

  // Enhance categories with actual subcategory counts by fetching from subcategoriesUrl
  const categoriesWithDisplayCounts: CategoryWithDisplayCount[] = await Promise.all(
    baseCategories.map(async (category) => {
      let count = 0;
      if (category.subcategoriesUrl) {
        try {
          // Fetch the specific category's JSON to count its subcategories
          const subcategoriesResponse = await fetch(category.subcategoriesUrl, { cache: 'no-store' }); // 'no-store' ensures fresh count
          if (subcategoriesResponse.ok) {
            const fetchedDetail: FetchedCategoryDetail = await subcategoriesResponse.json();
            if (fetchedDetail && typeof fetchedDetail.subcategories === 'object' && fetchedDetail.subcategories !== null) {
              count = Object.keys(fetchedDetail.subcategories).length;
            } else {
              console.warn(`Subcategory data for ${category.title} from ${category.subcategoriesUrl} was not in the expected format or empty when fetching for count.`);
            }
          } else {
            console.warn(`Failed to fetch subcategories from ${category.subcategoriesUrl} for count calculation: ${subcategoriesResponse.statusText}`);
          }
        } catch (e) {
          console.error(`Error fetching or parsing subcategory count for ${category.title} from ${category.subcategoriesUrl}:`, e);
        }
      } else if (category.subcategories && Array.isArray(category.subcategories)) {
        // Fallback if subcategories are already part of the category object
        count = category.subcategories.length;
      }
      return { ...category, displaySubcategoryCount: count };
    })
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">
        Explore Learning Categories
      </h1>
      
      {categoriesWithDisplayCounts.length === 0 ? (
        <div className="text-center py-10">
          <FolderSearch className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No Learning Categories Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            It looks like there are no learning categories available at the moment. 
            This could be because the data source is empty or there was an issue fetching the data.
            Please check your server logs for more specific error messages if this issue persists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoriesWithDisplayCounts.map((category) => (
            <CategoryCard
              key={category.id} 
              name={category.title} 
              iconUrl={category.icon} 
              subcategoryCount={category.displaySubcategoryCount} // Use the fetched count
              description={`Learn about various topics in ${category.title}.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
