const mySqlDatabase = require("./MysqlDatabase")
const mongoDatabase = require("./MongoDatabase")
const ObjectId = require('mongodb').ObjectId;

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

//from https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
function zeroFill(number, width)
{
    width -= number.toString().length;
    if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
}

function sqlIDtoMongoID(id) {
    return new ObjectId(zeroFill(id.toString(16), 24));
}

function migrate() {
    return new Promise(async (resolve, reject) => {
        try {
            mongoDatabase.initCollections().then(console.log)

            getMongoIngredientsFromSqlDB().then(res => mongoDatabase.insertDocuments(res, "Ingredient"));
            getMongoUsersFromSqlDB().then(res => mongoDatabase.insertDocuments(res, "User"));
            getMongoFollowsFromSqlDB().then(res => mongoDatabase.insertDocuments(res, "Follows"));

            getMongoRecipesFromSqlDB().then(res => mongoDatabase.insertDocuments(res, "Recipe"));
            getMongoMealPlansFromSqlDB().then(res => mongoDatabase.insertDocuments(res, "MealPlan"))
            //mySqlDatabase.getUsers().then(res => mongoDatabase.insertDocuments(res, "User"))
            resolve()
        } catch (e) {
            reject(e)
        }
    });
}

async function getMongoIngredientsFromSqlDB() {
    const sql = "SELECT * FROM Ingredient;";
    let data = await mySqlDatabase.queryStatement(sql);
    data.forEach(element => {
        element._id = sqlIDtoMongoID(element.ID);
        delete element.ID;
    });
    return data;
}

async function getMongoUsersFromSqlDB() {
    const sql = "SELECT User.ID, User.Name, User.Password, User.EmailAddress, User.BirthDate, User.RecipeLib, " +
                    "JSON_ARRAYAGG(JSON_OBJECT('MealPlanID', UserMealPlanLib.MealPlanID, 'Since', UserMealPlanLib.Since)) as MealPlanLib " +
                    "FROM (SELECT User.ID, User.Name, User.Password, User.EmailAddress, User.BirthDate, " +
                        "JSON_ARRAYAGG(JSON_OBJECT('RecipeID', UserRecipeLib.RecipeID, 'Since', UserRecipeLib.Since)) as RecipeLib " +
                        "FROM User LEFT OUTER JOIN UserRecipeLib " +
                        "ON User.ID = UserRecipeLib.UserID " +
                        "GROUP BY User.ID) as User " +
                    "LEFT OUTER JOIN UserMealPlanLib " +
                    "ON User.ID = UserMealPlanLib.UserID " +
                    "GROUP BY User.ID;";
    let data = await mySqlDatabase.queryStatement(sql);
    data.forEach(row => {
        row._id = sqlIDtoMongoID(row.ID);
        delete row.ID;
        row.RecipeLib = JSON.parse(row.RecipeLib);
        row.RecipeLib.forEach(r => {
            if(r["RecipeID"] != null) {
                r["RecipeID"] = sqlIDtoMongoID(r["RecipeID"]);
                r["Since"] = new Date(r["Since"]);
            }

        })
        row.MealPlanLib = JSON.parse(row.MealPlanLib);
        row.MealPlanLib.forEach(r => {
            if(r["MealPlanID"] != null) {
                r["MealPlanID"] = sqlIDtoMongoID(r["MealPlanID"]);
                r["Since"] = new Date(r["Since"]);
            }
        })
    });
    return data;
}

async function getMongoFollowsFromSqlDB() {
    const sql = "SELECT UserID, " +
        "JSON_ARRAYAGG(JSON_OBJECT('Follows', Follows)) " +
        "as Following FROM Follows " +
        "GROUP BY UserID " +
        "ORDER BY UserID ASC;";
    let data = await mySqlDatabase.queryStatement(sql);

    data.forEach(row => {
        row._id = sqlIDtoMongoID(row.UserID);
        delete row.UserID;
        row.Following = JSON.parse(row.Following)
        row.Following.forEach(f => f["Follows"] = sqlIDtoMongoID(f["Follows"]));
    })
    return data;
}

async function getMongoRecipesFromSqlDB() {
    let recipeSql = "SELECT Recipe.ID, Recipe.UserID, Recipe.Name, Recipe.Description, Recipe.ImageURL, Recipe.Created, " +
        "JSON_ARRAYAGG(JSON_OBJECT('StepNumber', PreparationStep.StepNumber, 'Description', PreparationStep.Description, 'Duration', PreparationStep.Duration)) " +
        "as PreparationSteps FROM Recipe LEFT JOIN PreparationStep ON Recipe.ID = PreparationStep.RecipeID GROUP BY Recipe.ID " +
        "ORDER BY Recipe.ID ASC;"
    let recipes = await mySqlDatabase.queryStatement(recipeSql)

    let ingredientsPerRecipeSql = "SELECT * FROM RecipeIngredients " +
        "ORDER BY RecipeID ASC";
    let ingredientsPerRecipes = await mySqlDatabase.queryStatement(ingredientsPerRecipeSql);

    let result = []
    let recipe = {}
    let ingredient = {}

    let i = 0;
    let j = ingredientsPerRecipes.length;
    recipes.forEach(row => {
        recipe = {
            "_id": sqlIDtoMongoID(row.ID),
            "UserID": sqlIDtoMongoID(row.UserID),
            "Name": row.Name,
            "Description": row.Description,
            "ImageURL": row.ImageURL,
            "Created": row.Created,
            "PreparationSteps": JSON.parse(row.PreparationSteps),
            "Ingredients": []
        }

        while(i < j && ingredientsPerRecipes[i].RecipeID < row.ID) {
            console.log("ERROR: Association from Recipe to Ingredient found, but no corresponding Recipe found: " + ingredientsPerRecipes[i].RecipeID + "!");
            ++i;
        }

        while(i < j && ingredientsPerRecipes[i].RecipeID === row.ID) {
            ingredient = {
                "IngredientID": sqlIDtoMongoID(ingredientsPerRecipes[i].IngredientID),
                "Gramms":ingredientsPerRecipes[i].Gramms
            }
            recipe.Ingredients.push(ingredient);
            ++i;
        }
        result.push(recipe)
    })
    return result
}

async function getMongoMealPlansFromSqlDB() {
    let mealPlansSql = "SELECT MealPlan.ID, MealPlan.Name, MealPlan.Description, MealPlan.Created, MealPlan.UserID, MealPlan.Properties, " +
                            "JSON_ARRAYAGG(JSON_OBJECT('RecipeID', MealPlanRecipes.RecipeID)) as Recipes " +
                            "FROM (SELECT MealPlan.ID, MealPlan.Name, MealPlan.Description, MealPlan.Created, MealPlan.UserID, " +
                                "JSON_ARRAYAGG(JSON_OBJECT('Name', Property.Name, 'Description', Property.Description)) as Properties " +
                                "FROM MealPlan LEFT OUTER JOIN MealPlanProperties ON MealPlan.ID = MealPlanProperties.MealPlanID " +
                                "LEFT OUTER JOIN Property ON MealPlanProperties.PropertyID = Property.ID " +
                                "GROUP BY MealPlan.ID) as MealPlan " +
                            "LEFT OUTER JOIN MealPlanRecipes " +
                            "ON MealPlan.ID = MealPlanRecipes.MealPlanID " +
                            "GROUP BY MealPlan.ID";
    let mealPlans = await mySqlDatabase.queryStatement(mealPlansSql);


    mealPlans.forEach(row => {
        row._id = sqlIDtoMongoID(row.ID);
        delete row.ID;
        row.UserID = sqlIDtoMongoID(row.UserID);
        row.Recipes = JSON.parse(row.Recipes);
        row.Recipes.forEach(r => {
            if(r["RecipeID"] != null)
                r["RecipeID"] = sqlIDtoMongoID(r["RecipeID"])
        });
        row.Properties = JSON.parse(row.Properties);
    });
    return mealPlans;
}

module.exports.migrate = migrate;