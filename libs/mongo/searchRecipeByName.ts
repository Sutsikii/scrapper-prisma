import mongoose from 'mongoose';
import Recipe from '../../models/Recipe';

/**
 * Recherche une recette par son nom dans MongoDB.
 * @param name Le nom de la recette à rechercher.
 * @returns La recette trouvée ou null si aucune recette ne correspond.
 */
export const searchRecipeByNameMongo = async (name: string) => {
  try {
    const recipe = await Recipe.findOne({
      title: { $regex: new RegExp(name, 'i') }, // Recherche partielle, insensible à la casse
    });
    return recipe;
  } catch (error) {
    console.error('Error searching recipe in MongoDB:', error);
    return null;
  }
};
