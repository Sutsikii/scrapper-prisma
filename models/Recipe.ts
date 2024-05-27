import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  prepTime: string | null;
  cookTime: string | null;
  serving: number | null;
  nutritionFact: string[][];
  ingredients: string[];
  steps: string[];
}

const RecipeSchema: Schema = new Schema({
  title: { type: String, required: true },
  prepTime: { type: String },
  cookTime: { type: String },
  serving: { type: Number },
  nutritionFact: { type: [[String]] },
  ingredients: { type: [String] },
  steps: { type: [String] }
});

const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
