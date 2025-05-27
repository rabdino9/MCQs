
import { getCategoryByName } from '@/lib/data';
import { SubcategoryCard } from '@/components/SubcategoryCard';
import { getIconForSubcategory } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600;

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  return {
    title: `${categoryName} Subcategories | Digital Tayari`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  const category = await getCategoryByName(categoryName);

  if (!category) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="mb-8">The category you are looking for does not exist.</p>
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
        {category.categoryName}
      </h1>
      <p className="text-lg text-muted-foreground text-center mb-10">
        Choose a subcategory to start learning.
      </p>
      {category.subcategories.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.subcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.subcategoryName}
            categoryName={category.categoryName}
            name={subcategory.subcategoryName}
            Icon={getIconForSubcategory(subcategory.subcategoryName)}
            questionCount={subcategory.questions.length}
          />
        ))}
      </div>
    </div>
  );
}
