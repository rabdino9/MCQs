
import Link from 'next/link';
import { BookHeart, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <BookHeart className="h-8 w-8" />
          <span className="text-xl font-bold sm:text-2xl">Digital Tayari</span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink max-w-xs sm:max-w-sm md:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
            <Input
              type="search"
              placeholder="Search courses, topics..."
              className="h-9 w-full rounded-md border-transparent bg-primary-foreground pl-10 pr-3 text-sm text-primary placeholder-primary/60 focus:border-transparent focus:ring-1 focus:ring-background/70"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary-foreground/20 active:bg-primary-foreground/30 rounded-full"
                  aria-label="AI Suggestion"
                >
                  <span role="img" aria-hidden="true" className="text-xl sm:text-2xl">🧠</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-background text-foreground border-border shadow-md">
                <p>AI Suggestion</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
