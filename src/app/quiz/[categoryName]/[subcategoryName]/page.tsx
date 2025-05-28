
import { getQuestionsForSubcategory, getSubcategoryById } from '@/lib/data';
import { QuizClient } from '@/components/QuizClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// export const revalidate = 0; // No caching for quiz page, always fetch fresh
interface QuizPageProps {
  params: {
    categoryName: string; // This is category.title
    subcategoryName: string; // This is subcategory.id
  };
}

export async function generateMetadata({ params }: QuizPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  const subcategoryId = decodeURIComponent(params.subcategoryName);
  const subcategory = getSubcategoryById(categoryName, subcategoryId); // Fetch subcategory for its title
  const displaySubcategoryName = subcategory ? subcategory.title : subcategoryId;

  return {
    title: `${displaySubcategoryName} Quiz | ${categoryName} | Digital Tayari`,
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  const subcategoryId = decodeURIComponent(params.subcategoryName); // This is the ID

  const questions = getQuestionsForSubcategory(categoryName, subcategoryId);
  const subcategory = getSubcategoryById(categoryName, subcategoryId); // Fetch again or pass from generateMetadata if possible
  
  const displaySubcategoryTitle = subcategory ? subcategory.title : subcategoryId;

  if (questions.length === 0) {
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

  // Pass the display title to QuizClient, but the ID (subcategoryName param) is used for topic in hints
  return <QuizClient questions={questions} categoryName={categoryName} subcategoryName={displaySubcategoryTitle} subcategoryId={subcategoryId} />;
}

// Fallback loading component (though QuizClient has its own loader)
// export function Loading() { // If QuizPage is async, Next.js automatically uses loading.tsx at this level
//   return (
//     <div className="container mx-auto py-8 px-4 flex flex-col items-center">
//       <div className="w-full max-w-2xl space-y-6">
//         <Skeleton className="h-10 w-3/4 mx-auto" />
//         <Skeleton className="h-6 w-1/2 mx-auto" />
//         <Skeleton className="h-8 w-full" /> 
//         <div className="space-y-4">
//           <Skeleton className="h-12 w-full" />
//           <Skeleton className="h-12 w-full" />
//           <Skeleton className="h-12 w-full" />
//           <Skeleton className="h-12 w-full" />
//         </div>
//         <Skeleton className="h-10 w-1/3 ml-auto" />
//       </div>
//     </div>
//   );
// }
// Ensure there is a loading.tsx in src/app/quiz/[categoryName]/[subcategoryName]/loading.tsx if needed.
// Or rely on the QuizClient's internal loader.
