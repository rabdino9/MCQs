
import { getQuestionsForSubcategory, getSubcategoryById, fetchCategories, getCategoryByName } from '@/lib/data';
import { QuizClient } from '@/components/QuizClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface QuizPageProps {
  params: {
    categoryName: string;    
    subcategoryName: string; 
  };
}

export async function generateStaticParams() {
  const categories = await fetchCategories(); 
  if (!categories || categories.length === 0) {
    console.warn("generateStaticParams for QuizPage: No categories found. Check public/data/categories.json.");
    return [];
  }

  const paramsPromises = categories.map(async (category) => {
    if (!category.title) {
      console.warn("generateStaticParams for QuizPage: Category found with no title during subcategory fetch:", category);
      return [];
    }
    const detailedCategory = await getCategoryByName(category.title); 
    if (detailedCategory && detailedCategory.subcategories && detailedCategory.subcategories.length > 0) {
      return detailedCategory.subcategories.map((subcategory) => {
        if (!subcategory.id) {
          console.warn("generateStaticParams for QuizPage: Subcategory found with no id:", subcategory, "under category:", category.title);
          return null;
        }
        return {
          categoryName: encodeURIComponent(category.title),
          subcategoryName: encodeURIComponent(subcategory.id), 
        };
      }).filter(param => param !== null);
    }
    return [];
  });

  const allParamsNested = await Promise.all(paramsPromises);
  return allParamsNested.flat(); 
}

export async function generateMetadata({ params }: QuizPageProps) {
  let categoryTitle = "Category";
  let subcategoryId = "Subcategory"; 
  let displaySubcategoryTitle = "Quiz";

  try {
    categoryTitle = decodeURIComponent(params.categoryName);
    subcategoryId = decodeURIComponent(params.subcategoryName);
    const subcategory = await getSubcategoryById(categoryTitle, subcategoryId);
    displaySubcategoryTitle = subcategory ? subcategory.title : subcategoryId; 
  } catch (e) {
    console.error("Error decoding params for metadata in QuizPage:", params, e);
  }
  
  return {
    title: `${displaySubcategoryTitle} Quiz | ${categoryTitle} | Digital Tayari`,
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  let categoryTitle = "";
  let subcategoryId = ""; 

  try {
    categoryTitle = decodeURIComponent(params.categoryName);
    subcategoryId = decodeURIComponent(params.subcategoryName);
  } catch (e) {
    console.error("Error decoding params for QuizPage:", params, e);
    return (
      <div className="container mx-auto py-8 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">Invalid Quiz URL</h1>
        <p className="mb-8 text-muted-foreground">
          The category or subcategory name in the URL is malformed.
        </p>
        <Button asChild>
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  const questions = await getQuestionsForSubcategory(categoryTitle, subcategoryId);
  const subcategory = await getSubcategoryById(categoryTitle, subcategoryId); 
  
  const displaySubcategoryTitle = subcategory ? subcategory.title : subcategoryId; 

  if (!questions || questions.length === 0) {
    let originalCategoryId = "";
    const tempCategory = await getCategoryByName(categoryTitle); // To get the original category ID for the error message
    if (tempCategory) originalCategoryId = tempCategory.id;

    return (
      <div className="container mx-auto py-8 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">No Questions Available</h1>
        <p className="mb-8 text-muted-foreground">
          Sorry, there are no questions for the "{displaySubcategoryTitle}" quiz in "{categoryTitle}" category.
          This might be because 'public/data/${originalCategoryId}.json' is missing, empty, the subcategory "${subcategoryId}" is not defined within it, or it has no questions.
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href={`/category/${encodeURIComponent(categoryTitle)}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subcategories
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <QuizClient questions={questions} categoryName={categoryTitle} subcategoryName={displaySubcategoryTitle} subcategoryId={subcategoryId} />;
}
