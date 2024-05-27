import mongoose from 'mongoose';
import RecipeModel from '../models/Recipe'; // Assurez-vous d'importer correctement le modèle Mongoose
import fs from 'fs';
import { PrismaClient } from '../prisma/generated/client1';

// Prisma client
const prisma = new PrismaClient();

// Connexion à MongoDB
const mongoUrl = process.env.MONGODB_URL;

(async () => {
  try {
    await mongoose.connect(mongoUrl as string, {});
    console.log('Connected to MongoDB');

    // Lire le fichier JSON
    const data = fs.readFileSync('./scrappedData/data.json', 'utf8');
    const recipes = JSON.parse(data);

    // Insérer les données dans PostgreSQL
    for (const recipe of recipes) {
      await prisma.recipe.create({
        data: {
          title: recipe.title,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          serving: recipe.serving,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        },
      });
    }
    console.log('Recipes inserted into PostgreSQL');

    // Insérer les données dans MongoDB
    await RecipeModel.insertMany(recipes);
    console.log('Recipes inserted into MongoDB');
  } catch (error) {
    console.error('Error inserting recipes:', error);
  } finally {
    await prisma.$disconnect();
    await mongoose.connection.close();
  }
})();
