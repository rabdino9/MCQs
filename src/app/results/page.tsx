
import { ResultsClient } from '@/components/ResultsClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Quiz Results | Digital Tayari',
};

// Fallback loading UI for the page itself
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}


export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsClient />
    </Suspense>
  );
}
