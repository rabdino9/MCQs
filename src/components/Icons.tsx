
import {
  BookOpenText,
  FlaskConical,
  Landmark,
  Cpu,
  Globe,
  Palette,
  Layers,
  Lightbulb,
  LucideIcon,
  HelpCircle,
  Type,
  Newspaper,
  BookMarked,
} from 'lucide-react';

export const Icons: { [key: string]: LucideIcon } = {
  default: HelpCircle,
  BookOpenText,
  FlaskConical,
  Landmark,
  Cpu,
  Globe,
  Palette,
  Layers,
  Lightbulb,
  Type,
  Newspaper,
  BookMarked,
};

const categoryIconMap: { [key: string]: LucideIcon } = {
  "General Knowledge": BookOpenText,
  "Science": FlaskConical,
  "History": Landmark,
  "Technology": Cpu,
  "Geography": Globe,
  "Arts & Literature": Palette,
  "Mathematics": Lightbulb, // Example, no direct math icon
  "English Language": Type,
  "Current Affairs": Newspaper,
  "Islamic Studies": BookMarked,
};

export function getIconForCategory(categoryName?: string): LucideIcon {
  if (categoryName && categoryIconMap[categoryName]) {
    return categoryIconMap[categoryName];
  }
  return Icons.default;
}

// For subcategories, we can use a generic approach or expand this map
export function getIconForSubcategory(subcategoryName?: string): LucideIcon {
  if (subcategoryName) {
    const lowerName = subcategoryName.toLowerCase();
    if (lowerName.includes("world")) return Globe;
    if (lowerName.includes("computer")) return Cpu;
    // Add more specific checks for other keywords if needed
  }
  return Layers; // Default icon if no specific match or if subcategoryName is undefined/empty
}
