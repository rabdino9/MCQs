
export interface Question {
  questionText: string; // from q
  options: string[];
  correctAnswer: string; // from options[a]
  explanation: string; // from ex
  furtherReadingLink?: string; // Made optional
}

export interface Subcategory {
  id: string; // e.g., "algebra", "geometry" (from the key in the subcategories object)
  title: string; // e.g., "Algebra", "Geometry" (from subcategory.title in JSON)
  questions: Question[];
}

export interface Category {
  id: string;
  title: string;
  icon: string; // Expected to be an image URL
  subcategoriesUrl?: string; // URL to fetch subcategories JSON
  subcategories?: Subcategory[]; // This will be populated from subcategoriesUrl
}

// This interface represents the structure of the JSON file fetched from subcategoriesUrl
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
