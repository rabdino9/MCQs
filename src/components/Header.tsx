
import Link from 'next/link';
import { BookHeart } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <BookHeart className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">Digital Tayari</span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
