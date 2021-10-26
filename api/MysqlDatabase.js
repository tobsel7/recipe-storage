const mysql = require("mysql")
const fs = require("fs")
const config = {
    host: "sql",
    user: "root",
    password: "password",
    database: "sql_recipes",
    port: "3306",
    multipleStatements: true
}
let database = require('mysql')
try {
    database = mysql.createConnection(config);
    console.log("Verbindung erfolgreich aufgebaut!");
} catch (ex) {
    console.log("Verbindung konnte nicht hergestellt werden!");
    console.log(ex.message);
    return;
}

function createTables() {
    const createSqlFile = fs.readFileSync("./sql/create_tables.sql").toString();
    return queryStatement(createSqlFile);
}

function dropTables() {
    const dropSqlFile = fs.readFileSync('./sql/drop_tables.sql').toString();
    return queryStatement(dropSqlFile);
}

function addIngredient(ingredient) {
    const statement = "INSERT INTO Ingredient (Name, Producer, Kcal, Carbs, Fat, Protein)\r\n"+
        "VALUES (\"" + ingredient.name + "\", \"" + ingredient.producer + "\", " + ingredient.kcal + ", " + ingredient.carbs + ", " + ingredient.fat + ", " + ingredient.protein + ")";
    console.log(statement);
    return queryStatement(statement);
}

function addRecipe(recipe) {
    let userID = "(SELECT ID FROM User WHERE Name = \"" + recipe.username + "\" LIMIT 1)"

    const sql = "INSERT INTO Recipe(Name, Description, ImageURL, Created, UserID) VALUES"
    const values = "(\"" + recipe.recipeName + "\", \"" + recipe.description + "\", \"" + recipe.imageURL + "\", CURDATE(), " + userID + ");";
    return queryStatement(sql + values)
}

function addRecipeIngredients(ingredients) {
    const recipeID = "(SELECT ID FROM Recipe WHERE Name = \"" + ingredients.recipeName + "\" LIMIT 1)"
    let sql = "INSERT INTO RecipeIngredients (RecipeID, IngredientID, Gramms) "
    let first = true
    for(let ingredient of ingredients.ingredients) {
        let ingredientID = "(SELECT ID FROM Ingredient WHERE Name = \"" + ingredient.name + "\" LIMIT 1)"
        if(first) {
            sql += " VALUES(" + recipeID + ", " + ingredientID + ", " + ingredient.amount + ")";
            first = false
        } else {
            sql += " ,VALUES(" + recipeID + ", " + ingredientID + ", " + ingredient.amount + ")";
        }

    }
    sql += ";"
    return queryStatement(sql)
}

function getMealPlansRecipesReport() {
    const sql = "SELECT plans.Name, plans.Description, user.Name AS UserName, plans.Created " +
        "FROM (SELECT Name, Description, Created, UserID FROM Recipe UNION SELECT Name, Description, Created, UserID " +
            "FROM MealPlan) plans " +
            "LEFT JOIN User AS user ON plans.UserID = user.ID " +
            "WHERE plans.Created > DATE_SUB(CURDATE(),INTERVAL 1 YEAR) " +
            "AND user.BirthDate > DATE_SUB(CURDATE(),INTERVAL 30 YEAR) " +
            "ORDER BY plans.Name;"
    let hrstart = process.hrtime();
    let data = queryStatement(sql);
    let hrend = process.hrtime(hrstart);
    console.log('SQL R1: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    return data;
}

function getPropertiesReport() {
    const sql = "(SELECT Name, Amount FROM " +
                    "(SELECT PropertyID, SUM(Amount) as Amount FROM " +

                        "(SELECT DISTINCT MealPlanID, COUNT(MealPlanID) as Amount " +
                        "FROM UserMealPlanLib " +
                        "WHERE (Since >= DATE_SUB(NOW(), INTERVAL 1 YEAR)) AND " +
                        "UserID IN (SELECT id from User where (BirthDate <= date_sub(now(), INTERVAL 60 YEAR))) " +
                        "GROUP BY MealPlanID) as MealPlans " +

                    "INNER JOIN MealPlanProperties ON " +
                    "MealPlans.MealPlanID = MealPlanProperties.MealPlanID " +
                    "GROUP BY PropertyID) as PropertiesAmount " +

                "INNER JOIN Property ON " +
                "PropertiesAmount.PropertyID = Property.ID " +
                "ORDER BY Amount DESC)"
    let hrstart = process.hrtime();
    let data = queryStatement(sql);
    let hrend = process.hrtime(hrstart);
    console.log('SQL R2: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    return data;
}

function queryStatement(statement) {
    return new Promise((resolve, reject) => {
        database.query(statement, (error, result) => {
            if (error)
                reject(error)
            else
                resolve(result)
        })
    })
}

module.exports.getPropertiesReport = getPropertiesReport;
module.exports.addIngredient = addIngredient;
module.exports.addRecipeIngredients = addRecipeIngredients;
module.exports.createTables = createTables;
module.exports.dropTables = dropTables;
module.exports.addRecipe = addRecipe;
module.exports.getMealPlansRecipesReport = getMealPlansRecipesReport;
module.exports.queryStatement = queryStatement;
