
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Question, UserAnswer as StoredUserAnswer } from '@/lib/types'; // Renaming to avoid conflict
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface QuizOutcome {
  questionText: string;
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  furtherReadingLink: string;
  isCorrect: boolean;
}

interface QuizScore {
  score: number;
  totalQuestions: number;
}

export function ResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<QuizOutcome[] | null>(null);
  const [scoreData, setScoreData] = useState<QuizScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = searchParams.get('category');
  const subcategoryName = searchParams.get('subcategory');

  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('quizResults');
      const storedScore = sessionStorage.getItem('quizScore');

      if (storedResults && storedScore) {
        setResults(JSON.parse(storedResults));
        setScoreData(JSON.parse(storedScore));
      } else {
        setError("Quiz results not found. Please complete a quiz first.");
      }
    } catch (e) {
      console.error("Error parsing results from session storage:", e);
      setError("There was an error loading your results.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !results || !scoreData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-destructive">Results Error</h1>
        <p className="mb-8 text-muted-foreground">{error || "Could not load quiz results."}</p>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  const { score, totalQuestions } = scoreData;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let feedbackMessage = "";
  if (percentage === 100) feedbackMessage = "Excellent! Perfect score!";
  else if (percentage >= 80) feedbackMessage = "Great job! You really know your stuff!";
  else if (percentage >= 60) feedbackMessage = "Good effort! Keep practicing!";
  else if (percentage >= 40) feedbackMessage = "Not bad, but there's room for improvement.";
  else feedbackMessage = "Keep learning and try again! You can do it!";


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-primary">Quiz Results</CardTitle>
          {categoryName && subcategoryName && (
            <CardDescription className="text-lg text-muted-foreground">
              {decodeURIComponent(subcategoryName)} - {decodeURIComponent(categoryName)}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-5xl font-bold text-primary">
              {score} / {totalQuestions}
            </p>
            <p className="text-2xl text-accent font-semibold mt-1">{percentage}%</p>
            <p className="text-md text-muted-foreground mt-3">{feedbackMessage}</p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center">Detailed Breakdown</h3>
            {results.map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-md font-medium flex-1 pr-4">{index + 1}. {item.questionText}</p>
                  {item.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                  )}
                </div>
                <p className={`text-sm ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  Your answer: {item.userAnswer || "Not answered"}
                </p>
                {!item.isCorrect && (
                  <p className="text-sm text-muted-foreground">Correct answer: {item.correctAnswer}</p>
                )}
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Explanation:</strong> {item.explanation}
                </p>
                {item.furtherReadingLink && (
                  <Button variant="link" asChild className="p-0 h-auto text-sm text-primary hover:text-primary/80">
                    <a href={item.furtherReadingLink} target="_blank" rel="noopener noreferrer">
                      Learn More <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Button 
            onClick={() => router.push(`/quiz/${categoryName}/${subcategoryName}`)} 
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!categoryName || !subcategoryName}
          >
            Try Quiz Again
          </Button>
          <Button 
            onClick={() => router.push('/')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            Back to Categories
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
