
import Recipe from '../models/Recipe';
import { Recipes } from '../types';

export const saveRecipeToMongo = async (recipe: Recipes): Promise<void> => {
  try {
    const newRecipe = new Recipe({
      title: recipe.title,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      serving: recipe.serving,
      nutritionFact: recipe.nutritionFact,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    });
    await newRecipe.save();
    console.log(`Recipe saved to MongoDB: ${recipe.title}`);
  } catch (error) {
    console.error('Error saving recipe to MongoDB:', error);
  }
};
