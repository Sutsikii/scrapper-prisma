import puppeteer from 'puppeteer';

export interface Recipes {
    prepTime: string | null
    cookTime: string | null
    serving: number | null,
    nutritionFact: string[][] | null
    ingredients: string[] | null
    steps: string[] | null
}

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
                prepTime, cookTime, serving, nutritionFact, ingredients, steps
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

(async () => {
    let recipeData = await getRecipesData("https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/")
    console.log(recipeData)
})()