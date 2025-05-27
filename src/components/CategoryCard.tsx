
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  name: string; // This will be category.title
  description?: string;
  iconUrl: string; // Changed from Icon component to URL
  subcategoryCount: number;
}

export function CategoryCard({ name, description, iconUrl, subcategoryCount }: CategoryCardProps) {
  const href = `/category/${encodeURIComponent(name)}`; // Name here is category.title
  return (
    <Card className="flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        {/* Use next/image for the icon */}
        <Image 
          src={iconUrl} 
          alt={`${name} icon`} 
          width={40} 
          height={40} 
          className="rounded-md" // Added some basic styling
          data-ai-hint="category icon" // Generic hint for AI image search
        />
        <div>
          <CardTitle className="text-xl font-semibold">{name}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {subcategoryCount} subcategor{subcategoryCount === 1 ? 'y' : 'ies'} available.
        </p>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Link href={href} passHref legacyBehavior>
          <Button variant="outline" className="w-full group bg-accent text-accent-foreground hover:bg-accent/90">
            Explore Category <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
