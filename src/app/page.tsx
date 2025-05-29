
import { fetchCategories, getCategoryByName } from '@/lib/data';
import { CategoryCard } from '@/components/CategoryCard';
import { AlertTriangle, FolderSearch } from 'lucide-react';
import type { Category as AppCategory } from '@/lib/types';

interface CategoryWithDisplayCount extends AppCategory {
  displaySubcategoryCount: number;
}

export default async function HomePage() {
  const baseCategories = await fetchCategories();

  if (!baseCategories || !Array.isArray(baseCategories)) {
    console.error("HomePage: categories data is critically invalid or undefined. Expected array from fetchCategories(), got:", baseCategories);
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Categories</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered a critical issue loading the learning categories.
          Please check your server build logs for specific error messages (e.g., ensure 'public/data/categories.json' is accessible and contains valid JSON).
          If the problem persists, contact support.
        </p>
      </div>
    );
  }

  if (baseCategories.length === 0) {
    console.warn("HomePage: fetchCategories returned an empty array. This will result in the 'No Learning Categories Found' message. Please check 'public/data/categories.json' for content and validity (e.g., ensure it's valid JSON, check for issues like trailing commas). Also, review server build logs for specific read/parse errors.");
  }

  const categoriesWithDisplayCounts: CategoryWithDisplayCount[] = await Promise.all(
    baseCategories.map(async (category) => {
      let count = 0;
      if (category.id && category.title) {
        try {
          const detailedCategory = await getCategoryByName(category.title);
          if (detailedCategory && detailedCategory.subcategories && Array.isArray(detailedCategory.subcategories)) {
            count = detailedCategory.subcategories.length;
          }
        } catch (error) {
          console.warn(`Error processing subcategories for ${category.title} (id: ${category.id}) for count on homepage:`, error);
        }
      } else {
        console.warn(`Category is missing an 'id' or 'title', cannot count subcategories. Category data:`, category);
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
            This could be because 'public/data/categories.json' is empty or there was an issue reading the data.
            Please check your server build logs for specific error messages if this issue persists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoriesWithDisplayCounts.map((category) => (
            <CategoryCard
              key={category.id} 
              name={category.title} 
              iconUrl={category.icon} 
              subcategoryCount={category.displaySubcategoryCount}
              description={`Learn about various topics in ${category.title}.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
