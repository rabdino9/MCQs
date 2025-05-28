
import { getQuestionsForSubcategory, getSubcategoryById, fetchCategories, getCategoryByName } from '@/lib/data';
import { QuizClient } from '@/components/QuizClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface QuizPageProps {
  params: {
    categoryName: string; 
    subcategoryName: string; // This is subcategory.id
  };
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  if (!categories) return [];

  const params = [];
  for (const category of categories) {
    // Need to fetch subcategories for this category
    const detailedCategory = await getCategoryByName(category.title); 
    if (detailedCategory && detailedCategory.subcategories) {
      for (const subcategory of detailedCategory.subcategories) {
        params.push({
          categoryName: encodeURIComponent(category.title),
          subcategoryName: encodeURIComponent(subcategory.id),
        });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: QuizPageProps) {
  let categoryName = "Category";
  let subcategoryId = "Subcategory";
  let displaySubcategoryName = "Quiz";

  try {
    categoryName = decodeURIComponent(params.categoryName);
    subcategoryId = decodeURIComponent(params.subcategoryName);
    const subcategory = await getSubcategoryById(categoryName, subcategoryId);
    displaySubcategoryName = subcategory ? subcategory.title : subcategoryId;
  } catch (e) {
    console.error("Error decoding params for metadata:", params, e);
  }
  
  return {
    title: `${displaySubcategoryName} Quiz | ${categoryName} | Digital Tayari`,
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  let categoryName = "";
  let subcategoryId = "";

  try {
    categoryName = decodeURIComponent(params.categoryName);
    subcategoryId = decodeURIComponent(params.subcategoryName); // This is the ID
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

  const questions = await getQuestionsForSubcategory(categoryName, subcategoryId);
  const subcategory = await getSubcategoryById(categoryName, subcategoryId); 
  
  const displaySubcategoryTitle = subcategory ? subcategory.title : subcategoryId;

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">No Questions Available</h1>
        <p className="mb-8 text-muted-foreground">
          Sorry, there are no questions for the "{displaySubcategoryTitle}" quiz in "{categoryName}" category at the moment.
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href={`/category/${encodeURIComponent(categoryName)}`}>
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

  return <QuizClient questions={questions} categoryName={categoryName} subcategoryName={displaySubcategoryTitle} subcategoryId={subcategoryId} />;
}
