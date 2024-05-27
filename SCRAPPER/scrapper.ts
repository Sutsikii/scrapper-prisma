import puppeteer from 'puppeteer';
import fs from 'fs';
import cluster from 'cluster';
import os from 'os';

import mongoose from 'mongoose';

import { PrismaClient } from '../prisma/generated/client1';
import Recipe from '../models/Recipe';

const prisma = new PrismaClient();
const mongoUrl = process.env.MONGODB_URL;

mongoose.connect(mongoUrl as string, {}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB', error);
  process.exit(1);
});

export interface Recipes {
    title: string | null;
    prepTime: string | null;
    cookTime: string | null;
    serving: number | null;
    nutritionFact: string[][] | null;
    ingredients: string[] | null;
    steps: string[] | null;
}

export const getRecipesCategoriesList = async (): Promise<string[]> => [
    "https://www.allrecipes.com/recipes/15054/everyday-cooking/cooking-for-one/quick-and-easy/",
    // Autres URLs de catégories
];

/**
 * Récupère les données de recette depuis une URL
 * @param url URL de la recette
 * @returns Objet contenant les données de la recette
 */
export const getRecipesData = async (url: string): Promise<Recipes | null> => {
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto(url);
        await page.setViewport({ width: 1080, height: 1024 });

        const recipes: Recipes = await page.evaluate((): Recipes => {
            const blockerCookie = document.getElementById("onetrust-banner-sdk");
            if (blockerCookie) {
                blockerCookie.style.display = "none";
            }

            let titleH1 = document.querySelectorAll("#article-header--recipe_1-0 h1")[0] as HTMLHeadElement;
            let title = titleH1.innerText;
            let prepTime: string = document.querySelectorAll(".mntl-recipe-details__item")[0].children[1].innerHTML;
            let cookTime: string = document.querySelectorAll(".mntl-recipe-details__item")[1].children[1].innerHTML;
            let serving: number = parseInt(document.querySelectorAll(".mntl-recipe-details__item")[3].children[1].innerHTML);

            let nutritionFact: string[][] = [];
            document.querySelectorAll(".mntl-nutrition-facts-summary__table-row").forEach((e) => {
                nutritionFact.push([e.querySelectorAll("td")[1].innerText, e.querySelectorAll("td")[0].innerText]);
            });

            let ingredients: string[] = [];
            document.querySelectorAll(".mntl-structured-ingredients__list li p").forEach((e) => {
                let thisIngredient = "";
                e.querySelectorAll("span").forEach((text) => {
                    thisIngredient = thisIngredient + " " + text.innerText;
                });
                ingredients.push(thisIngredient);
            });

            let steps: string[] = [];
            Array.prototype.slice.call(document.querySelector("#recipe__steps-content_1-0 > ol")?.children).map(e => {
                steps.push(e.querySelector("p").innerText);
            });

            return {
                title, prepTime, cookTime, serving, nutritionFact, ingredients, steps
            };
        });

        await browser.close();
        return recipes;

    } catch (error) {
        console.log(error);
        await browser.close();
        return null;
    }
};

/**
 * Récupère les URLs de recettes depuis une URL de catégorie
 * @param url URL de la catégorie
 * @returns Liste des URLs de recettes
 */
export const getRecipesUrlByCategory = async (url: string): Promise<string[] | null> => {
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto(url);
        await page.setViewport({ width: 1080, height: 1024 });

        let recipesUrl = await page.evaluate(() => {
            let urlList: string[] = [];
            let link = document.querySelectorAll("a.card") as NodeListOf<HTMLLinkElement>;
            link.forEach(url => urlList.push(url.href));
            return urlList;
        });

        await browser.close();
        return recipesUrl;

    } catch (error) {
        console.log(error);
        await browser.close();
        return null;
    }
};

/**
 * Enregistre une recette dans PostgreSQL avec Prisma
 * @param recipe Données de la recette
 */
const saveRecipeToPostgres = async (recipe: Recipes) => {
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

/**
 * Enregistre une recette dans MongoDB avec Mongoose
 * @param recipe Données de la recette
 */
const saveRecipeToMongo = async (recipe: Recipes) => {
    try {
        const newRecipe = new Recipe({
            title: recipe.title,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            serving: recipe.serving,
            nutritionFact: recipe.nutritionFact,
            ingredients: recipe.ingredients,
            steps: recipe.steps
        });
        await newRecipe.save();
        console.log(`Recipe saved to MongoDB: ${recipe.title}`);
    } catch (error) {
        console.error('Error saving recipe to MongoDB:', error);
    }
};

/**
 * Fonction principale pour scraper les recettes et les enregistrer dans les bases de données
 */
export const main = async () => {
    let recipesCategoriesList = await getRecipesCategoriesList();
    let recipesUrlList: string[] = [];
    let recipesDataList: Recipes[] = [];

    for await (const category of recipesCategoriesList) {
        console.log("Category : " + category);

        let recipesUrlListByCategory = await getRecipesUrlByCategory(category);

        if (recipesUrlListByCategory) {
            for await (const recipes of recipesUrlListByCategory) {
                console.log("\t Recette : " + recipes);

                recipesUrlList.push(recipes);
            }
        }
    }

    console.log(recipesUrlList);

    let totalRecipes = recipesUrlList.length;
    let nbrGotRecipes = 0;
    let nbrNullRecipes = 0;

    for (const recipesUrl of recipesUrlList) {
        let recipeData = await getRecipesData(recipesUrl);
        if (recipeData) {
            console.clear();
            recipesDataList.push(recipeData);
            console.log('Add : "' + recipeData.title + '"');
            console.log("\n");
            nbrGotRecipes++;

            // Save to PostgreSQL
            await saveRecipeToPostgres(recipeData);

            // Save to MongoDB
            await saveRecipeToMongo(recipeData);
        } else {
            nbrNullRecipes++;
        }

        console.log("-----------------------------------------------------");
        console.log("Got recipes : " + nbrGotRecipes + "/" + totalRecipes);
        console.log("Null recipes : " + nbrNullRecipes + "/" + totalRecipes);
        console.log("-----------------------------------------------------");
    }

    console.log("Writing file");
    ecrireJSONDansFichier("./scrappedData/" + "data.json", recipesDataList);
};

// Fonction pour écrire un objet JSON dans un fichier
export function ecrireJSONDansFichier(nomFichier: string, donneesJSON: Recipes[]) {
    const donneesJSONString = JSON.stringify(donneesJSON, null, 2);
    fs.writeFile(nomFichier, donneesJSONString, (err) => {
        if (err) {
            console.error("Erreur lors de l'écriture du fichier :", err);
            return;
        }
        console.log(`Les données ont été écrites dans le fichier ${nomFichier} avec succès.`);
    });
}

// Fonction pour obtenir une chaîne de caractères représentant la date actuelle
export function obtenirDateString() {
    const maintenant = new Date();
    const nom = "data"; // Nom de votre choix
    const jour = maintenant.getDate().toString().padStart(2, '0');
    const mois = (maintenant.getMonth() + 1).toString().padStart(2, '0');
    const annee = maintenant.getFullYear().toString();
    const heure = maintenant.getHours().toString().padStart(2, '0');
    const minutes = maintenant.getMinutes().toString().padStart(2, '0');
    const secondes = maintenant.getSeconds().toString().padStart(2, '0');

    return `${nom}_${jour}-${mois}-${annee}_${heure}-${minutes}-${secondes}`;
}

(async () => { await main(); })();
