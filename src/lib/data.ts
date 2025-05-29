
import type { Category, Subcategory, Question, FetchedCategoryDetail } from './types';
import fs from 'fs/promises';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'public/data');

let allCategoriesCache: Category[] | null = null;

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`SyntaxError in JSON file ${filePath}: ${error.message}`);
    } else if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn(`File not found: ${filePath}. This category may not have subcategories defined in /public/data, or the ID in categories.json is incorrect.`);
    } else {
      console.error(`Failed to read or parse ${filePath}:`, error);
    }
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (allCategoriesCache !== null) {
    return JSON.parse(JSON.stringify(allCategoriesCache));
  }

  const categoriesFilePath = path.join(dataDirectory, 'categories.json');
  console.log(`Fetching main categories from local file: ${categoriesFilePath}`);
  const categoriesData = await readJsonFile<Omit<Category, 'subcategories' | 'subcategoriesUrl'>[]>(categoriesFilePath);

  if (!categoriesData || !Array.isArray(categoriesData)) {
    console.error(
      `Failed to load categories from ${categoriesFilePath} or data is not an array.` +
      ` Please ensure 'public/data/categories.json' exists, is a valid JSON array, and contains category objects with 'id', 'title', and 'icon'.`
    );
    allCategoriesCache = [];
    return [];
  }

  const categoriesToCache: Category[] = categoriesData.map(cat => ({
    ...cat,
    subcategories: undefined, 
  }));

  allCategoriesCache = categoriesToCache;
  return JSON.parse(JSON.stringify(allCategoriesCache));
}

export async function getCategoryByName(categoryTitle: string): Promise<Category | undefined> {
  if (allCategoriesCache === null) {
    await fetchCategories();
  }

  const cachedCategory = allCategoriesCache!.find(cat => cat.title === categoryTitle);

  if (!cachedCategory) {
    console.warn(`Category with title "${categoryTitle}" not found in local cache/data.`);
    return undefined;
  }

  if (cachedCategory.subcategories !== undefined) {
    return JSON.parse(JSON.stringify(cachedCategory));
  }

  if (!cachedCategory.id) {
    console.warn(`Category "${cachedCategory.title}" is missing an 'id' field. Cannot load subcategories from local file.`);
    cachedCategory.subcategories = [];
    return JSON.parse(JSON.stringify(cachedCategory));
  }

  const subcategoryFilePath = path.join(dataDirectory, `${cachedCategory.id}.json`);
  const detailData = await readJsonFile<FetchedCategoryDetail>(subcategoryFilePath);

  if (detailData && typeof detailData.subcategories === 'object' && detailData.subcategories !== null) {
    const transformedSubcategories: Subcategory[] = Object.entries(detailData.subcategories).map(
      ([subcategoryId, subcatData]) => {
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
      }
    );
    cachedCategory.subcategories = transformedSubcategories;
  } else {
    cachedCategory.subcategories = [];
  }

  return JSON.parse(JSON.stringify(cachedCategory));
}

export async function getSubcategoryById(categoryTitle: string, subcategoryIdToFind: string): Promise<Subcategory | undefined> {
  const category = await getCategoryByName(categoryTitle);
  if (category && Array.isArray(category.subcategories)) {
    return category.subcategories.find(sub => sub.id === subcategoryIdToFind);
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
