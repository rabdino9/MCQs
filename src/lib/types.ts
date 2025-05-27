
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  furtherReadingLink: string;
}

export interface Subcategory {
  subcategoryName: string;
  questions: Question[];
}

export interface Category {
  id: string;         // Changed from categoryName for ID
  title: string;      // This will be used as the display name
  icon: string;       // This is expected to be an image URL
  subcategoriesUrl?: string; // URL to fetch subcategories
  subcategories?: Subcategory[]; // Kept optional for potential downstream compatibility
}

export interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
}
