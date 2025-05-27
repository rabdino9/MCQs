
import type { Category, Subcategory, Question, FetchedCategoryDetail } from './types';
import { CATEGORIES_JSON_URL } from './constants';

// Removed allCategoriesCache variable

async function fetchAllData(): Promise<Category[]> {
  // Removed the check for allCategoriesCache
  // Now, this function will always attempt to fetch from the CATEGORIES_JSON_URL

  try {
    const response = await fetch(CATEGORIES_JSON_URL, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Failed to fetch main categories: ${response.statusText} (status: ${response.status})`);
      return []; // Return empty array on fetch error
    }
    
    let parsedData: unknown;
    try {
      parsedData = await response.json();
    } catch (jsonError) {
      console.error("Error parsing main categories JSON data:", jsonError);
      return []; // Return empty array on JSON parsing error
    }

    if (Array.isArray(parsedData)) {
      const categories = parsedData as Category[];
      // Ensure subcategories are initially undefined so they can be loaded on demand
      categories.forEach(cat => {
        cat.subcategories = undefined; 
      });
      return categories; // Return the freshly fetched and parsed categories
    } else {
      console.error("Fetched main categories data is not an array. Received type:", typeof parsedData, "Data:", parsedData);
      return []; // Return empty array if data is not an array
    }
  } catch (fetchError) {
    console.error("Generic error in fetchAllData process:", fetchError);
    return []; // Return empty array on any other fetch error
  }
}

export async function fetchCategories(): Promise<Category[]> {
  return await fetchAllData();
}

export async function getCategoryByName(categoryTitle: string): Promise<Category | undefined> {
  const categories = await fetchAllData(); // This will now always fetch fresh data for the main list
  const category = categories.find(cat => cat.title === categoryTitle);

  if (category && category.subcategoriesUrl && category.subcategories === undefined) {
    try {
      console.log(`Fetching subcategories for ${category.title} from ${category.subcategoriesUrl}`);
      const subcategoriesResponse = await fetch(category.subcategoriesUrl, { cache: 'no-store' });
      if (!subcategoriesResponse.ok) {
        console.error(`Failed to fetch subcategories for ${category.title}: ${subcategoriesResponse.statusText}`);
        category.subcategories = []; 
        return category;
      }
      
      const fetchedDetail: FetchedCategoryDetail = await subcategoriesResponse.json();
      
      if (fetchedDetail && typeof fetchedDetail.subcategories === 'object' && fetchedDetail.subcategories !== null) {
        const transformedSubcategories: Subcategory[] = Object.entries(fetchedDetail.subcategories).map(([subcategoryId, subcatData]) => {
          const transformedQuestions: Question[] = subcatData.questions.map(q => ({
            questionText: q.q,
            options: q.options,
            correctAnswer: q.options[q.a], 
            explanation: q.ex,
            furtherReadingLink: undefined, 
          }));
          return {
            id: subcategoryId,
            title: subcatData.title,
            questions: transformedQuestions,
          };
        });
        category.subcategories = transformedSubcategories;

        // Removed the part that updated the old allCategoriesCache as it no longer exists
      } else {
        console.error(`Subcategory data for ${category.title} is not in the expected format.`);
        category.subcategories = []; 
      }
    } catch (error) {
      console.error(`Error fetching or parsing subcategories for ${category.title}:`, error);
      category.subcategories = []; 
    }
  }
  return category;
}

export async function getSubcategoryById(categoryTitle: string, subcategoryId: string): Promise<Subcategory | undefined> {
  const category = await getCategoryByName(categoryTitle); 
  if (category && Array.isArray(category.subcategories)) {
    return category.subcategories.find(sub => sub.id === subcategoryId);
  }
  return undefined;
}

export async function getQuestionsForSubcategory(categoryTitle: string, subcategoryId: string): Promise<Question[]> {
  const subcategory = await getSubcategoryById(categoryTitle, subcategoryId);
  if (subcategory && Array.isArray(subcategory.questions)) {
    return subcategory.questions;
  }
  return [];
}
