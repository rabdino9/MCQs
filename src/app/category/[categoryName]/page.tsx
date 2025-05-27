
import { getCategoryByName } from '@/lib/data';
import { SubcategoryCard } from '@/components/SubcategoryCard';
import { getIconForSubcategory } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600; // Revalidate data every hour, could be 0 for dev

interface CategoryPageProps {
  params: {
    categoryName: string; // This is actually category.title from the route
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryTitle = decodeURIComponent(params.categoryName);
  return {
    title: `${categoryTitle} Subcategories | Digital Tayari`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryTitle = decodeURIComponent(params.categoryName);
  // getCategoryByName will now fetch subcategories if subcategoriesUrl is present
  const category = await getCategoryByName(categoryTitle);

  if (!category) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="mb-8">The category "{categoryTitle}" does not exist or could not be loaded.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="outline" className="mb-8">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-center mb-2 text-primary">
        {category.title} 
      </h1>
      <p className="text-lg text-muted-foreground text-center mb-10">
        Choose a subcategory to start learning.
      </p>
      {/* 
        The skeleton loading might briefly show if subcategories are being fetched by getCategoryByName.
        If category.subcategories is fetched and ends up empty, this skeleton might not be ideal.
        A more refined loading state might be needed if subcategory fetching is slow.
        For now, this relies on category.subcategories being populated (or genuinely empty).
      */}
      {(!category.subcategories || category.subcategories.length === 0) && category.subcategoriesUrl && (
        // Show skeleton only if subcategories are expected (subcategoriesUrl exists) but not yet loaded or empty after fetch attempt
        // This is a basic loading indicator; a more robust one would involve Suspense if getCategoryByName was a component
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow animate-pulse">
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
              <Skeleton className="h-6 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
              <Skeleton className="h-10 w-full mt-auto bg-muted" />
            </div>
          ))}
        </div>
      )}
       {category.subcategories && category.subcategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.subcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory.subcategoryName}
              categoryName={category.title} // Pass the category title
              name={subcategory.subcategoryName}
              Icon={getIconForSubcategory(subcategory.subcategoryName)} // Icons are still from local map
              questionCount={subcategory.questions?.length || 0}
            />
          ))}
        </div>
      ) : (
         (!category.subcategoriesUrl) && (
          <p className="text-center text-muted-foreground mt-6">
            No subcategories are available for {category.title} at the moment.
          </p>
         )
      )}
       {/* Message if subcategoriesUrl existed but fetch resulted in empty or error */}
       {category.subcategoriesUrl && (!category.subcategories || category.subcategories.length === 0) && (
         <p className="text-center text-muted-foreground mt-6">
            Could not load subcategories for {category.title}, or none are defined.
          </p>
       )}
    </div>
  );
}

