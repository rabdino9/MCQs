
import type { Category, Subcategory, Question } from './types';
import { CATEGORIES_JSON_URL } from './constants';

let allCategoriesCache: Category[] | null = null;

async function fetchAllData(): Promise<Category[]> {
  if (allCategoriesCache && Array.isArray(allCategoriesCache)) {
    // If cache exists and is a valid array, return it.
    // This allows getCategoryByName to populate subcategories into the cached objects.
    return allCategoriesCache;
  }

  try {
    const response = await fetch(CATEGORIES_JSON_URL);

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
      // Ensure subcategories are initially undefined or empty so they can be loaded on demand
      allCategoriesCache.forEach(cat => {
        if (cat.subcategoriesUrl && !cat.subcategories) {
          cat.subcategories = []; // Initialize as empty, to be filled by getCategoryByName
        }
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

  if (category && category.subcategoriesUrl && (!category.subcategories || category.subcategories.length === 0)) {
    // If subcategoriesUrl exists and subcategories are not loaded (or empty array was placeholder)
    try {
      console.log(`Fetching subcategories for ${category.title} from ${category.subcategoriesUrl}`);
      const subcategoriesResponse = await fetch(category.subcategoriesUrl);
      if (!subcategoriesResponse.ok) {
        console.error(`Failed to fetch subcategories for ${category.title}: ${subcategoriesResponse.statusText}`);
        category.subcategories = []; // Set to empty on error
        return category;
      }
      const subcategoriesData: Subcategory[] = await subcategoriesResponse.json();
      if (Array.isArray(subcategoriesData)) {
        category.subcategories = subcategoriesData;
         // Update cache: find the category in allCategoriesCache and update its subcategories
        if (allCategoriesCache) {
            const cachedCategoryIndex = allCategoriesCache.findIndex(c => c.id === category.id);
            if (cachedCategoryIndex !== -1) {
                allCategoriesCache[cachedCategoryIndex].subcategories = subcategoriesData;
            }
        }
      } else {
        console.error(`Subcategory data for ${category.title} is not an array.`);
        category.subcategories = [];
      }
    } catch (error) {
      console.error(`Error fetching or parsing subcategories for ${category.title}:`, error);
      category.subcategories = []; // Set to empty on error
    }
  }
  return category;
}

export async function getSubcategoryByName(categoryTitle: string, subcategoryName: string): Promise<Subcategory | undefined> {
  const category = await getCategoryByName(categoryTitle); // This will now load subcategories if needed
  if (category && Array.isArray(category.subcategories)) {
    return category.subcategories.find(sub => sub.subcategoryName === subcategoryName);
  }
  return undefined;
}

export async function getQuestionsForSubcategory(categoryTitle: string, subcategoryName: string): Promise<Question[]> {
  const subcategory = await getSubcategoryByName(categoryTitle, subcategoryName);
  if (subcategory && Array.isArray(subcategory.questions)) {
    return subcategory.questions;
  }
  return [];
}
