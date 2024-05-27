import mongoose from 'mongoose';
import Recipe from '../models/Recipe'; // Assurez-vous d'importer correctement le modèle Mongoose
import { PrismaClient } from '../prisma/generated/client1';

const prisma = new PrismaClient();
const mongoUrl = process.env.MONGODB_URL;

mongoose.connect(mongoUrl as string, {}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB', error);
  process.exit(1);
});

/**
 * Nettoie la base de données PostgreSQL en supprimant toutes les recettes.
 */
const cleanPostgres = async () => {
  try {
    await prisma.recipe.deleteMany({});
    console.log('All recipes deleted from PostgreSQL');
  } catch (error) {
    console.error('Error cleaning PostgreSQL database:', error);
  }
};

/**
 * Nettoie la base de données MongoDB en supprimant toutes les recettes.
 */
const cleanMongo = async () => {
  try {
    await Recipe.deleteMany({});
    console.log('All recipes deleted from MongoDB');
  } catch (error) {
    console.error('Error cleaning MongoDB database:', error);
  }
};

/**
 * Nettoie les bases de données PostgreSQL et MongoDB.
 */
const cleanDatabases = async () => {
  await cleanPostgres();
  await cleanMongo();
};

cleanDatabases().then(() => {
  console.log('Databases cleaned successfully');
  mongoose.connection.close();
  prisma.$disconnect();
}).catch((error) => {
  console.error('Error cleaning databases:', error);
  mongoose.connection.close();
  prisma.$disconnect();
});
