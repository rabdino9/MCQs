
import { getCategoryByName } from '@/lib/data';
import { SubcategoryCard } from '@/components/SubcategoryCard';
import { getIconForSubcategory } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPageProps {
  params: {
    categoryName: string; // This is category.title from the route
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryTitle = decodeURIComponent(params.categoryName);
  // Potentially fetch category here to get its actual title if it differs from param or for subcategory count for SEO
  return {
    title: `${categoryTitle} Subcategories | Digital Tayari`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryTitle = decodeURIComponent(params.categoryName);
  const category = await getCategoryByName(categoryTitle); // This will fetch subcategories if subcategoriesUrl is present

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

  // Initial check if subcategories might be loading
  const isLoadingSubcategories = category.subcategoriesUrl && category.subcategories === undefined;

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
      
      {isLoadingSubcategories && (
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
              key={subcategory.id}
              categoryName={category.title} 
              subcategoryId={subcategory.id}
              subcategoryTitle={subcategory.title}
              Icon={getIconForSubcategory(subcategory.title)} // Use subcategory title for icon mapping for now
              questionCount={subcategory.questions?.length || 0}
            />
          ))}
        </div>
      ) : !isLoadingSubcategories && ( // Only show "no subcategories" if not loading
          <p className="text-center text-muted-foreground mt-6">
            {category.subcategoriesUrl ? `Could not load subcategories for ${category.title}, or none are defined.` : `No subcategories are available for ${category.title} at the moment.`}
          </p>
      )}
    </div>
  );
}
