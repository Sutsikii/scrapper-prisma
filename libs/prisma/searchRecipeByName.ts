import { PrismaClient } from "../../prisma/generated/client1";

const prisma = new PrismaClient();

/**
 * Recherche une recette par son nom dans PostgreSQL.
 * @param name Le nom de la recette à rechercher.
 * @returns La recette trouvée ou null si aucune recette ne correspond.
 */
export const searchRecipeByNamePostgres = async (name: string) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: {
        title: {
          contains: name, // Recherche partielle, insensible à la casse
          mode: 'insensitive',
        },
      },
    });
    return recipe;
  } catch (error) {
    console.error('Error searching recipe in PostgreSQL:', error);
    return null;
  }
};
