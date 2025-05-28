
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  name: string; // This will be category.title
  description?: string;
  iconUrl: string; // Can be an image URL or an emoji string
  subcategoryCount: number;
}

export function CategoryCard({ name, description, iconUrl, subcategoryCount }: CategoryCardProps) {
  const href = `/category/${encodeURIComponent(name)}`;

  let iconDisplayElement: React.ReactNode;

  let isPotentialUrl = false;
  if (iconUrl && (iconUrl.startsWith('http://') || iconUrl.startsWith('https://'))) {
    try {
      new URL(iconUrl); // Validate if it's a well-formed URL
      isPotentialUrl = true;
    } catch (_) {
      // Not a valid URL structure, will be handled by emoji/placeholder logic
      isPotentialUrl = false;
    }
  }

  if (isPotentialUrl) {
    // It's a potential image URL
    iconDisplayElement = (
      <Image
        src={iconUrl}
        alt={`${name} icon`}
        width={40}
        height={40}
        className="rounded-md object-contain" // Added object-contain
        onError={(e) => {
          // If image fails to load, replace with a placeholder
          (e.target as HTMLImageElement).src = 'https://placehold.co/40x40.png';
          (e.target as HTMLImageElement).alt = 'Placeholder icon';
           // Add data-ai-hint for the placeholder
          (e.target as HTMLImageElement).dataset.aiHint = 'placeholder icon';
          console.warn(`Image from "${iconUrl}" failed to load for category "${name}". Displaying placeholder.`);
        }}
      />
    );
  } else if (iconUrl && iconUrl.trim() !== '') {
    // Not an HTTP/HTTPS URL, but a non-empty string: treat as emoji/text
    iconDisplayElement = (
      <span className="flex items-center justify-center w-10 h-10 text-3xl" role="img" aria-label={`${name} icon`}>
        {iconUrl}
      </span>
    );
  } else {
    // Fallback: iconUrl is empty, or was a malformed non-http URL
    iconDisplayElement = (
      <Image
        src="https://placehold.co/40x40.png"
        alt="Placeholder icon"
        width={40}
        height={40}
        className="rounded-md"
        data-ai-hint="placeholder icon"
      />
    );
    if (iconUrl) { // Log only if iconUrl was present but invalid
        console.warn(`Invalid iconUrl ("${iconUrl}") for category "${name}". Using placeholder image.`);
    } else {
        console.warn(`Empty iconUrl for category "${name}". Using placeholder image.`);
    }
  }

  return (
    <Card className="flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <div className="w-10 h-10 flex items-center justify-center"> {/* Ensure consistent sizing for emoji or image */}
          {iconDisplayElement}
        </div>
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

    