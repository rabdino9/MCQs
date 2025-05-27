
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
  categoryName: string;
  subcategories: Subcategory[];
}

export interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
}
