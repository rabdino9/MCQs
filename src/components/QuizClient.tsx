
"use client";

import type { Question } from '@/lib/types';
import { generatePersonalizedHint } from '@/ai/flows/generate-personalized-hint';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Lightbulb, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface QuizClientProps {
  questions: Question[];
  categoryName: string; // Display name of the category
  subcategoryName: string; // Display name/title of the subcategory
  subcategoryId: string; // ID of the subcategory (used for hint topic)
}

export function QuizClient({ questions, categoryName, subcategoryName, subcategoryId }: QuizClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<string | null>>(Array(questions.length).fill(null));
  const [feedback, setFeedback] = useState<Array<'correct' | 'incorrect' | null>>(Array(questions.length).fill(null));
  const [hints, setHints] = useState<Array<string | null>>(Array(questions.length).fill(null));
  const [hintLoading, setHintLoading] = useState<Array<boolean>>(Array(questions.length).fill(false));
  const [score, setScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSelect = (value: string) => {
    if (feedback[currentQuestionIndex] !== null) return; // Already answered

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = value;
    setSelectedAnswers(newSelectedAnswers);

    const newFeedback = [...feedback];
    if (value === currentQuestion.correctAnswer) {
      newFeedback[currentQuestionIndex] = 'correct';
      setScore(prevScore => prevScore + 1);
    } else {
      newFeedback[currentQuestionIndex] = 'incorrect';
    }
    setFeedback(newFeedback);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz finished
      const userAnswersForStorage = questions.map((q, idx) => ({
        questionText: q.questionText,
        userAnswer: selectedAnswers[idx],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        furtherReadingLink: q.furtherReadingLink, // This will be undefined if not present
        isCorrect: selectedAnswers[idx] === q.correctAnswer
      }));
      sessionStorage.setItem('quizResults', JSON.stringify(userAnswersForStorage));
      sessionStorage.setItem('quizScore', JSON.stringify({score, totalQuestions}));
      
      router.push(`/results?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}`); // Use display name for query params
    }
  };

  const handleGetHint = async () => {
    if (hintLoading[currentQuestionIndex] || hints[currentQuestionIndex]) return;

    const newHintLoading = [...hintLoading];
    newHintLoading[currentQuestionIndex] = true;
    setHintLoading(newHintLoading);

    try {
      const hintData = await generatePersonalizedHint({
        question: currentQuestion.questionText,
        answerChoices: currentQuestion.options,
        userAnswer: selectedAnswers[currentQuestionIndex] || undefined,
        topic: subcategoryId, // Use subcategory ID as the topic for the AI
      });
      const newHints = [...hints];
      newHints[currentQuestionIndex] = hintData.hint;
      setHints(newHints);
      toast({
        title: "Hint Generated!",
        description: "A hint is now available for this question.",
      });
    } catch (error) {
      console.error("Error generating hint:", error);
      toast({
        title: "Error",
        description: "Could not generate a hint at this time.",
        variant: "destructive",
      });
    } finally {
      const finalHintLoading = [...hintLoading];
      finalHintLoading[currentQuestionIndex] = false;
      setHintLoading(finalHintLoading);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentQuestion) {
     return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>No questions found for this quiz. This might happen if the data structure is incorrect or the file is empty.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">{subcategoryName} Quiz</CardTitle> {/* Use display name */}
          <CardDescription className="text-center">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardDescription>
          <Progress value={progressPercentage} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-6 text-center">{currentQuestion.questionText}</p>
          <RadioGroup
            onValueChange={handleAnswerSelect}
            value={selectedAnswers[currentQuestionIndex] || ""}
            disabled={feedback[currentQuestionIndex] !== null}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer transition-all duration-200
                  ${selectedAnswers[currentQuestionIndex] === option 
                    ? feedback[currentQuestionIndex] === 'correct' ? 'border-green-500 bg-green-500/10 shadow-md' 
                    : feedback[currentQuestionIndex] === 'incorrect' ? 'border-red-500 bg-red-500/10 shadow-md'
                    : 'border-primary bg-primary/10 shadow-md'
                    : 'hover:bg-muted/50'
                  }
                  ${feedback[currentQuestionIndex] !== null && option !== currentQuestion.correctAnswer && selectedAnswers[currentQuestionIndex] === option ? 'opacity-70' : ''}
                  ${feedback[currentQuestionIndex] !== null && option === currentQuestion.correctAnswer ? 'border-green-500 bg-green-500/10 font-semibold' : ''}
                `}
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="shrink-0" />
                <span>{option}</span>
                {feedback[currentQuestionIndex] !== null && selectedAnswers[currentQuestionIndex] === option && (
                  feedback[currentQuestionIndex] === 'correct' 
                    ? <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                    : <XCircle className="ml-auto h-5 w-5 text-red-500" />
                )}
                 {feedback[currentQuestionIndex] !== null && option === currentQuestion.correctAnswer && selectedAnswers[currentQuestionIndex] !== option && (
                   <CheckCircle className="ml-auto h-5 w-5 text-green-500 opacity-70" />
                 )}
              </Label>
            ))}
          </RadioGroup>

          {feedback[currentQuestionIndex] === 'incorrect' && !hints[currentQuestionIndex] && (
            <Button
              onClick={handleGetHint}
              variant="outline"
              className="mt-6 w-full group border-accent text-accent hover:text-accent-foreground hover:bg-accent"
              disabled={hintLoading[currentQuestionIndex]}
            >
              {hintLoading[currentQuestionIndex] ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              Get a Hint
            </Button>
          )}

          {hints[currentQuestionIndex] && (
            <Alert variant="default" className="mt-6 bg-yellow-100 border-yellow-400 text-yellow-700">
              <Info className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="font-semibold text-yellow-800">Hint</AlertTitle>
              <AlertDescription className="text-yellow-700">{hints[currentQuestionIndex]}</AlertDescription>
            </Alert>
          )}
          
          {feedback[currentQuestionIndex] && (
             <Alert variant={feedback[currentQuestionIndex] === 'correct' ? "default" : "destructive"} className={`mt-6 ${feedback[currentQuestionIndex] === 'correct' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
              {feedback[currentQuestionIndex] === 'correct' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              <AlertTitle className="font-semibold">
                {feedback[currentQuestionIndex] === 'correct' ? "Correct!" : "Incorrect"}
              </AlertTitle>
              <AlertDescription>
                {feedback[currentQuestionIndex] === 'correct' ? "Great job!" : `The correct answer is: ${currentQuestion.correctAnswer}.`}
                <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
                 {currentQuestion.furtherReadingLink && (
                  <p className="mt-2">
                    <a href={currentQuestion.furtherReadingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Learn more
                    </a>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex justify-end">
          {feedback[currentQuestionIndex] !== null && (
            <Button onClick={handleNextQuestion} className="bg-primary hover:bg-primary/90">
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="mt-4 text-sm text-muted-foreground">Score: {score}/{totalQuestions}</div>
    </div>
  );
}
