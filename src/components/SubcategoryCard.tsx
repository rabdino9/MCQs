
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SubcategoryCardProps {
  categoryName: string;
  name: string;
  Icon: LucideIcon;
  questionCount: number;
}

export function SubcategoryCard({ categoryName, name, Icon, questionCount }: SubcategoryCardProps) {
  const href = `/quiz/${encodeURIComponent(categoryName)}/${encodeURIComponent(name)}`;
  return (
    <Card className="flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Icon className="h-8 w-8 text-primary" />
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {questionCount} question{questionCount === 1 ? '' : 's'} in this quiz.
        </p>
      </CardContent>
       <div className="p-4 pt-0 mt-auto">
        <Link href={href} passHref legacyBehavior>
          <Button className="w-full group bg-accent text-accent-foreground hover:bg-accent/90">
            Start Quiz <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
