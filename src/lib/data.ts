
import type { Category, Subcategory, Question, FetchedCategoryDetail } from './types';
import { CATEGORIES_JSON_URL } from './constants';

let allCategoriesCache: Category[] | null = null;

async function fetchAllData(): Promise<Category[]> {
  if (allCategoriesCache && Array.isArray(allCategoriesCache)) {
    return allCategoriesCache;
  }

  try {
    const response = await fetch(CATEGORIES_JSON_URL, { cache: 'no-store' }); // Disable cache for main categories list for now

    if (!response.ok) {
      console.error(`Failed to fetch main categories: ${response.statusText} (status: ${response.status})`);
      allCategoriesCache = []; 
      return [];
    }
    
    let parsedData: unknown;
    try {
      parsedData = await response.json();
    } catch (jsonError) {
      console.error("Error parsing main categories JSON data:", jsonError);
      allCategoriesCache = []; 
      return [];
    }

    if (Array.isArray(parsedData)) {
      allCategoriesCache = parsedData as Category[];
      // Ensure subcategories are initially undefined so they can be loaded on demand
      allCategoriesCache.forEach(cat => {
        cat.subcategories = undefined; 
      });
    } else {
      console.error("Fetched main categories data is not an array. Received type:", typeof parsedData, "Data:", parsedData);
      allCategoriesCache = [];
    }
    return allCategoriesCache;
  } catch (fetchError) {
    console.error("Generic error in fetchAllData process:", fetchError);
    allCategoriesCache = [];
    return []; 
  }
}

export async function fetchCategories(): Promise<Category[]> {
  return await fetchAllData();
}

export async function getCategoryByName(categoryTitle: string): Promise<Category | undefined> {
  const categories = await fetchAllData();
  const category = categories.find(cat => cat.title === categoryTitle);

  if (category && category.subcategoriesUrl && category.subcategories === undefined) {
    // If subcategoriesUrl exists and subcategories are not yet loaded
    try {
      console.log(`Fetching subcategories for ${category.title} from ${category.subcategoriesUrl}`);
      const subcategoriesResponse = await fetch(category.subcategoriesUrl, { cache: 'no-store' }); // Disable cache for subcategory files
      if (!subcategoriesResponse.ok) {
        console.error(`Failed to fetch subcategories for ${category.title}: ${subcategoriesResponse.statusText}`);
        category.subcategories = []; // Set to empty on error to prevent re-fetch
        return category;
      }
      
      const fetchedDetail: FetchedCategoryDetail = await subcategoriesResponse.json();
      
      if (fetchedDetail && typeof fetchedDetail.subcategories === 'object' && fetchedDetail.subcategories !== null) {
        const transformedSubcategories: Subcategory[] = Object.entries(fetchedDetail.subcategories).map(([subcategoryId, subcatData]) => {
          const transformedQuestions: Question[] = subcatData.questions.map(q => ({
            questionText: q.q,
            options: q.options,
            correctAnswer: q.options[q.a], // Get correct answer string using index 'a'
            explanation: q.ex,
            furtherReadingLink: undefined, // Not present in new JSON
          }));
          return {
            id: subcategoryId,
            title: subcatData.title,
            questions: transformedQuestions,
          };
        });
        category.subcategories = transformedSubcategories;

        // Update cache if allCategoriesCache is available
        if (allCategoriesCache) {
            const cachedCategoryIndex = allCategoriesCache.findIndex(c => c.id === category.id);
            if (cachedCategoryIndex !== -1) {
                allCategoriesCache[cachedCategoryIndex].subcategories = transformedSubcategories;
            }
        }
      } else {
        console.error(`Subcategory data for ${category.title} is not in the expected format.`);
        category.subcategories = []; // Set to empty on error
      }
    } catch (error) {
      console.error(`Error fetching or parsing subcategories for ${category.title}:`, error);
      category.subcategories = []; // Set to empty on error
    }
  }
  return category;
}

export async function getSubcategoryById(categoryTitle: string, subcategoryId: string): Promise<Subcategory | undefined> {
  const category = await getCategoryByName(categoryTitle); // This will load subcategories if needed
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
