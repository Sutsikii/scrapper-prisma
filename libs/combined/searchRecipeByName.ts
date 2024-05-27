import { searchRecipeByNameMongo } from "../mongo/searchRecipeByName";
import { searchRecipeByNamePostgres } from "../prisma/searchRecipeByName";

/**
 * Recherche une recette par son nom dans PostgreSQL et MongoDB.
 * @param name Le nom de la recette à rechercher.
 * @returns La recette trouvée ou null si aucune recette ne correspond.
 */
export const searchRecipeByName = async (name: string) => {
  const recipePostgres = await searchRecipeByNamePostgres(name);
  if (recipePostgres) {
    return { source: 'PostgreSQL', recipe: recipePostgres };
  }

  const recipeMongo = await searchRecipeByNameMongo(name);
  if (recipeMongo) {
    return { source: 'MongoDB', recipe: recipeMongo };
  }

  return null;
};
