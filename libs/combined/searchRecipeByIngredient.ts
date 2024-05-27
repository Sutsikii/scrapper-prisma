import Recipe from "../../models/Recipe";
import { PrismaClient } from "../../prisma/generated/client1";

const prisma = new PrismaClient();

/**
 * Recherche des recettes par ingrédient dans PostgreSQL.
 * @param ingredient L'ingrédient à rechercher.
 * @returns La liste des recettes trouvées ou un tableau vide si aucune recette ne correspond.
 */
export const searchRecipeByIngredientPostgres = async (ingredient: string) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        ingredients: {
          has: ingredient, // Recherche des recettes contenant l'ingrédient
        },
      },
    });
    return recipes;
  } catch (error) {
    console.error('Error searching recipes in PostgreSQL:', error);
    return [];
  }
};

/**
 * Recherche des recettes par ingrédient dans MongoDB.
 * @param ingredient L'ingrédient à rechercher.
 * @returns La liste des recettes trouvées ou un tableau vide si aucune recette ne correspond.
 */
export const searchRecipeByIngredientMongo = async (ingredient: string) => {
  try {
    const recipes = await Recipe.find({
      ingredients: { $regex: new RegExp(ingredient, 'i') }, // Recherche des recettes contenant l'ingrédient
    });
    return recipes;
  } catch (error) {
    console.error('Error searching recipes in MongoDB:', error);
    return [];
  }
};

/**
 * Recherche des recettes par ingrédient dans PostgreSQL et MongoDB.
 * @param ingredient L'ingrédient à rechercher.
 * @returns La liste des recettes trouvées ou un tableau vide si aucune recette ne correspond.
 */
export const searchRecipeByIngredient = async (ingredient: string) => {
  const recipesPostgres = await searchRecipeByIngredientPostgres(ingredient);
  const recipesMongo = await searchRecipeByIngredientMongo(ingredient);

  return [...recipesPostgres, ...recipesMongo];
};
