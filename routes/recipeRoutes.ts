import { Router, Request, Response } from 'express';
import { searchRecipeByName } from '../libs/combined/searchRecipeByName';
import { searchRecipeByIngredient } from '../libs/combined/searchRecipeByIngredient';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).send('Please provide a valid recipe name.');
  }

  try {
    const result = await searchRecipeByName(name);
    if (result) {
      res.status(200).json({
        source: result.source,
        recipe: result.recipe,
      });
    } else {
      res.status(404).send('Recipe not found.');
    }
  } catch (error) {
    res.status(500).send('An error occurred while searching for the recipe.');
  }
});

router.get('/searchByIngredient', async (req: Request, res: Response) => {
  const { ingredient } = req.query;

  if (!ingredient || typeof ingredient !== 'string') {
    return res.status(400).send('Please provide a valid ingredient.');
  }

  try {
    const recipes = await searchRecipeByIngredient(ingredient);
    if (recipes.length > 0) {
      res.status(200).json(recipes);
    } else {
      res.status(404).send('No recipes found with the given ingredient.');
    }
  } catch (error) {
    res.status(500).send('An error occurred while searching for recipes.');
  }
});

export default router;
