
import type { Category, Subcategory, Question } from './types';
import { CATEGORIES_JSON_URL } from './constants';

let allCategoriesCache: Category[] | null = null;

async function fetchAllData(): Promise<Category[]> {
  // Check cache first. If it's already a valid array, return it.
  if (allCategoriesCache && Array.isArray(allCategoriesCache)) {
    return allCategoriesCache;
  }
  // If cache exists but is not an array (e.g., due to a previous error or bad state),
  // reset it to force re-fetch.
  if (allCategoriesCache !== null && !Array.isArray(allCategoriesCache)) {
      console.warn("allCategoriesCache was not an array, resetting for re-fetch.");
      allCategoriesCache = null;
  }

  try {
    const response = await fetch(CATEGORIES_JSON_URL);

    if (!response.ok) {
      console.error(`Failed to fetch categories: ${response.statusText} (status: ${response.status})`);
      allCategoriesCache = []; // Set cache to empty array on HTTP error
      return [];
    }
    
    let parsedData: unknown;
    try {
      parsedData = await response.json();
    } catch (jsonError) {
      console.error("Error parsing JSON data:", jsonError);
      allCategoriesCache = []; // Set cache to empty array on JSON parsing error
      return [];
    }

    if (Array.isArray(parsedData)) {
      // At this point, we assume parsedData is Category[] based on the structure.
      // For a more robust solution, one might validate each item in parsedData
      // against the Category schema, but this addresses the immediate undefined issue.
      allCategoriesCache = parsedData as Category[];
    } else {
      console.error("Fetched data is not an array. Received type:", typeof parsedData, "Data:", parsedData);
      allCategoriesCache = []; // Default to empty array if data is not an array
    }
    return allCategoriesCache;
  } catch (fetchError) { // Catching errors from fetch() itself or other unexpected errors during the process
    console.error("Generic error in fetchAllData process:", fetchError);
    allCategoriesCache = []; // Ensure cache is an empty array on any caught error
    return []; 
  }
}

export async function fetchCategories(): Promise<Category[]> {
  // fetchAllData is now designed to always return an array.
  return await fetchAllData();
}

export async function getCategoryByName(categoryName: string): Promise<Category | undefined> {
  const categories = await fetchAllData(); // Should be an array
  return categories.find(cat => cat.categoryName === categoryName);
}

export async function getSubcategoryByName(categoryName: string, subcategoryName: string): Promise<Subcategory | undefined> {
  const category = await getCategoryByName(categoryName);
  if (category && Array.isArray(category.subcategories)) {
    return category.subcategories.find(sub => sub.subcategoryName === subcategoryName);
  }
  return undefined;
}

export async function getQuestionsForSubcategory(categoryName: string, subcategoryName: string): Promise<Question[]> {
  const subcategory = await getSubcategoryByName(categoryName, subcategoryName);
  if (subcategory && Array.isArray(subcategory.questions)) {
    return subcategory.questions;
  }
  return [];
}
