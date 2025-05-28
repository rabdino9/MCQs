
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Branding section with non-clickable emoji and app name */}
        <div className="flex items-center">
          <span role="img" aria-label="Digital Tayari logo" className="text-2xl sm:text-3xl">🧠</span>
          <span className="ml-2 text-xl font-bold sm:text-2xl">Digital Tayari</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink max-w-xs sm:max-w-sm md:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
            <Input
              type="search"
              placeholder="Search courses, topics..."
              className="h-9 w-full rounded-md border-transparent bg-primary-foreground pl-10 pr-3 text-sm text-primary placeholder-primary/60 focus:border-transparent focus:ring-1 focus:ring-background/70"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
