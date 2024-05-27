
import { PrismaClient } from '../prisma/generated/client1';
import { Recipes } from '../types';

const prisma = new PrismaClient();

export const saveRecipeToPostgres = async (recipe: Recipes): Promise<void> => {
  try {
    await prisma.recipe.create({
      data: {
        title: recipe.title || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        serving: recipe.serving || 0,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || []
      }
    });
    console.log(`Recipe saved to PostgreSQL: ${recipe.title}`);
  } catch (error) {
    console.error('Error saving recipe to PostgreSQL:', error);
  }
};
