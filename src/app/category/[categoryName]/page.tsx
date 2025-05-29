
import { getCategoryByName, fetchCategories } from '@/lib/data';
import { SubcategoryCard } from '@/components/SubcategoryCard';
import { getIconForSubcategory } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPageProps {
  params: {
    categoryName: string; 
  };
}

export async function generateStaticParams() {
  const categories = await fetchCategories(); 
  if (!categories || categories.length === 0) {
    console.warn("generateStaticParams for CategoryPage: No categories found. Check public/data/categories.json.");
    return [];
  }
  return categories.map((category) => {
    if (!category.title) {
      console.warn("generateStaticParams for CategoryPage: Category found with no title:", category);
      return { categoryName: '' }; 
    }
    return {
      categoryName: encodeURIComponent(category.title),
    }
  }).filter(param => param.categoryName); 
}

export async function generateMetadata({ params }: CategoryPageProps) {
  let categoryTitle = "Category";
  try {
    categoryTitle = decodeURIComponent(params.categoryName);
  } catch (e) {
    console.error("Error decoding categoryName for metadata in CategoryPage:", params.categoryName, e);
  }
  return {
    title: `${categoryTitle} Subcategories | Digital Tayari`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  let categoryTitle = "";
  try {
    categoryTitle = decodeURIComponent(params.categoryName);
  } catch (e) {
    console.error("Error decoding categoryName in CategoryPage:", params.categoryName, e);
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid Category URL</h1>
        <p className="mb-8">The category name in the URL is malformed.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Link>
        </Button>
      </div>
    );
  }
  
  const category = await getCategoryByName(categoryTitle);

  if (!category) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="mb-8">The category "{categoryTitle}" does not exist or could not be loaded from local data. Check 'public/data/categories.json' and 'public/data/&lt;id&gt;.json'.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Link>
        </Button>
      </div>
    );
  }

  const isLoadingSubcategories = false; 

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
      
      {isLoadingSubcategories && (!category.subcategories || category.subcategories.length === 0) && (
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
              Icon={getIconForSubcategory(subcategory.title)}
              questionCount={subcategory.questions?.length || 0}
            />
          ))}
        </div>
      ) : !isLoadingSubcategories && (
          <p className="text-center text-muted-foreground mt-6">
            {category.id ? `No subcategories are available for ${category.title}. Check 'public/data/${category.id}.json'.` : `No subcategories could be loaded for ${category.title}.`}
          </p>
      )}
    </div>
  );
}
