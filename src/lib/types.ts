
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  furtherReadingLink?: string;
}

export interface Subcategory {
  id: string; // e.g., "algebra"
  title: string; // e.g., "Algebra"
  questions: Question[];
}

export interface Category {
  id: string; // e.g., "math", used to find <id>.json for subcategories
  title: string;
  icon: string;
  subcategoriesUrl?: string; // Optional, not primary for fetching if local files are used by id
  subcategories?: Subcategory[]; // Populated from local <id>.json
}

// This interface represents the structure of individual <category-id>.json files
// (e.g., public/data/math.json)
export interface FetchedCategoryDetail {
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  subcategories: {
    // Keys are subcategory IDs (e.g., "algebra")
    [subcategoryId: string]: {
      title: string; // Display title (e.g., "Algebra")
      questions: Array<{
        q: string;
        options: string[];
        a: number; // index of the correct answer
        ex: string;
      }>;
    };
  };
}

export interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
}
