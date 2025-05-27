
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

export function getIconForCategory(categoryName: string): LucideIcon {
  return categoryIconMap[categoryName] || Icons.default;
}

// For subcategories, we can use a generic approach or expand this map
export function getIconForSubcategory(subcategoryName: string): LucideIcon {
  // Simple example: could be more sophisticated
  if (subcategoryName.toLowerCase().includes("world")) return Globe;
  if (subcategoryName.toLowerCase().includes("computer")) return Cpu;
  return Layers;
}
