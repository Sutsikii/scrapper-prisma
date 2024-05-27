import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { dbConnectionTest } from './Utils/prismaUtils';
import recipeRoutes from '../routes/recipeRoutes'; // Assurez-vous d'importer correctement

dotenv.config();

const app = express();
const mongoUrl = process.env.MONGODB_URL;

app.use(cors());
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello World');
});

app.use('/api/recipes', recipeRoutes); // Utilisez la route définie

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

(async () => {
  // Test de connexion à PostgreSQL
  if (!(await dbConnectionTest())) {
    console.log("Erreur de connexion à PostgreSQL");
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }

  // Connexion à MongoDB
  try {
    await mongoose.connect(mongoUrl as string, {});
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }
})();
