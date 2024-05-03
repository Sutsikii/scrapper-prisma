import puppeteer from 'puppeteer';
import fs from 'fs'
import cluster from 'cluster';
import os from 'os';

export interface Recipes {
    title: string | null
    prepTime: string | null
    cookTime: string | null
    serving: number | null,
    nutritionFact: string[][] | null
    ingredients: string[] | null
    steps: string[] | null
}

export const getRecipesCategoriesList = async (): Promise<string[]> => [
    "https://www.allrecipes.com/recipes/15054/everyday-cooking/cooking-for-one/quick-and-easy/",
    // "https://www.allrecipes.com/recipes/476/everyday-cooking/cooking-for-two/",
    // "https://www.allrecipes.com/recipes/22992/everyday-cooking/sheet-pan-dinners/",
    // "https://www.allrecipes.com/recipes/17253/everyday-cooking/slow-cooker/main-dishes/",
    // "https://www.allrecipes.com/recipes/265/everyday-cooking/vegetarian/main-dishes/",
    // "https://www.allrecipes.com/recipes/1320/healthy-recipes/main-dishes/",
    // "https://www.allrecipes.com/recipes/80/main-dish/",
    // "https://www.allrecipes.com/recipes/256/main-dish/meatloaf/",
    // "https://www.allrecipes.com/recipes/17245/main-dish/pasta/",
    // "https://www.allrecipes.com/recipes/674/main-dish/pork/pork-chops/",
    // "https://www.allrecipes.com/recipes/260/main-dish/salads/",
    // "https://www.allrecipes.com/recipes/475/meat-and-poultry/beef/steaks/",
    // "https://www.allrecipes.com/recipes/664/meat-and-poultry/chicken/baked-and-roasted/",
]

/**
 * 
 * @param url recipes's url
 * @returns object with recipe data
 */
export const getRecipesData = async (url: string): Promise<Recipes | null> => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: true
    });

    try {


        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(url);

        // Set screen size
        await page.setViewport({ width: 1080, height: 1024 });

        const recipes: Recipes = await page.evaluate((): Recipes => {
            const blockerCookie = document.getElementById("onetrust-banner-sdk")
            if (blockerCookie) {
                blockerCookie.style.display = "none"
            }

            let titleH1 = document.querySelectorAll("#article-header--recipe_1-0 h1")[0] as HTMLHeadElement
            let title = titleH1.innerText
            let prepTime: string = document.querySelectorAll(".mntl-recipe-details__item")[0].children[1].innerHTML
            let cookTime: string = document.querySelectorAll(".mntl-recipe-details__item")[1].children[1].innerHTML
            let serving: number = parseInt(document.querySelectorAll(".mntl-recipe-details__item")[3].children[1].innerHTML)

            let nutritionFact: string[][] = []
            document.querySelectorAll(".mntl-nutrition-facts-summary__table-row").forEach((e) => {
                nutritionFact.push([e.querySelectorAll("td")[1].innerText, e.querySelectorAll("td")[0].innerText])
            })

            let ingredients: string[] = []
            document.querySelectorAll(".mntl-structured-ingredients__list li p").forEach((e) => {
                let thisIngredient = "";
                e.querySelectorAll("span").forEach((text) => {
                    thisIngredient = thisIngredient + " " + text.innerText
                })
                ingredients.push(thisIngredient)
            })

            let steps: string[] = []
            Array.prototype.slice.call(document.querySelector("#recipe__steps-content_1-0 > ol")?.children).map(e => {
                steps.push(e.querySelector("p").innerText)
            });

            return {
                title, prepTime, cookTime, serving, nutritionFact, ingredients, steps
            }
        })
        await browser.close();
        return recipes

    } catch (error) {
        console.log(error)
        await browser.close();
        return null
    }


}

/**
 * 
 * @param url de la caetgori
 * @returns 
 */
export const getRecipesUrlByCategory = async (url: string): Promise<string[] | null> => {
    const browser = await puppeteer.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(url);

        // Set screen size
        await page.setViewport({ width: 1080, height: 1024 });

        let recipesUrl = await page.evaluate(() => {
            let urlList: string[] = []
            let link = document.querySelectorAll("a.card") as NodeListOf<HTMLLinkElement>
            link.forEach(url => urlList.push(url.href))
            return urlList
        })

        await browser.close();
        return recipesUrl

    } catch (error) {
        console.log(error)
        await browser.close();
        return null
    }

}

// Fonction pour écrire un objet JSON dans un fichier
export function ecrireJSONDansFichier(nomFichier: string, donneesJSON: Recipes[]) {
    // Convertir l'objet JSON en chaîne JSON
    const donneesJSONString = JSON.stringify(donneesJSON, null, 2);

    // Écrire la chaîne JSON dans le fichier
    fs.writeFile(nomFichier, donneesJSONString, (err) => {
        if (err) {
            console.error("Erreur lors de l'écriture du fichier :", err);
            return;
        }
        console.log(`Les données ont été écrites dans le fichier ${nomFichier} avec succès.`);
    });
}

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

export const main = async () => {
    let recipesCategoriesList = await getRecipesCategoriesList()
    let recipesUrlList: string[] = []
    let recipesDataList: Recipes[] = []

    for await (const category of recipesCategoriesList) {
        console.log("Category : " + category)

        let recipesUrlListByCategory = await getRecipesUrlByCategory(category)

        if (recipesUrlListByCategory) {
            for await (const recipes of recipesUrlListByCategory) {
                console.log("\t Recette : " + recipes)

                recipesUrlList.push(recipes)

            }
        }
    }

    console.log(recipesUrlList)

    let totalRecipes = recipesUrlList.length
    let nbrGotRecipes = 0
    let nbrNullRecipes = 0

    if (!cluster.isPrimary) {
        const numCPUs = os.cpus().length;
        console.log(`Nombre de cœurs : ${numCPUs}`);

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });

    } else {
        for (const recipesUrl of recipesUrlList) {
            let recipeData = await getRecipesData(recipesUrl)
            if (recipeData) {
                console.clear()
                recipesDataList.push(recipeData)
                console.log('Add : "' + recipeData.title + '"')
                console.log("\n")
                nbrGotRecipes++
            } else { nbrNullRecipes++ }

            console.log("-----------------------------------------------------")
            console.log("Got recipes : " + nbrGotRecipes + "/" + totalRecipes)
            console.log("Null recipes : " + nbrNullRecipes + "/" + totalRecipes)
            console.log("-----------------------------------------------------")
        }
    }

    console.log("Writing file")
    ecrireJSONDansFichier("./scrappedData/" + obtenirDateString() + ".json", recipesDataList)

}

(async () => { await main() })()