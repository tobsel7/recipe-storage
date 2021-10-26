const mysql = require("../MysqlDatabase");
const fs = require("fs")

function fillIngredients(amount) {
    let file = fs.readFileSync("./sql/Ingredients.csv").toString();
    file = file.replace('\r\n', '\n');
    let fileArray = file.split('\n');
    let statement = "USE sql_recipes;\r\n" +
        "INSERT IGNORE INTO Ingredient (Name, Producer, Kcal, Carbs, Fat, Protein)\r\n VALUES ";
    for(let i = 0; i < amount; ++i) {
        let row = Math.ceil(Math.random() * (fileArray.length - 1));
        if (row === 0)
            row = 1;

        let rowData = fileArray[row].split(";");

        let name = rowData[0];
        let producer = "Producer " + Math.floor(Math.random() * 100) + 1;
        let kcal = parseFloat(rowData[1].replace(/,/g, '.'));
        let carbs = parseFloat(rowData[4].replace(/,/g, '.'));
        let fat = parseFloat(rowData[2].replace(/,/g, '.'));
        let protein = parseFloat(rowData[3].replace(/,/g, '.'));

        statement += "(\"" + name + "\", \"" + producer + "\", " + kcal + ", " + carbs + ", " + fat + ", " + protein + "),\r\n";
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

function fillUsers(amount) {
    let file = fs.readFileSync("./sql/Users.csv").toString();
    file = file.replace('\r\n', '\n');
    let fileArray = file.split("\n");

    let statement = "USE sql_recipes;\r\n" +
        "INSERT IGNORE INTO User (Name, Password, EmailAddress, BirthDate)\r\n VALUES";

    // Add default user
    statement += "(\"Testuser\", \"Bestuser1234\", \"testuser@non-existing-mail.com\", CURDATE()),\r\n";

    for (let i = 0; i < amount; ++i) {
        let row = Math.ceil(Math.random() * (fileArray.length - 1));
        if (row === 0)
            row = 1;

        let rowData = fileArray[row].split(";");

        let name = "RandomName" + i; //rowData[0];
        let password = Math.round(Math.random() * 10000000 + 10000000).toString();
        let email = "email@Random" + i; //rowData[1];
        let birthDate = rowData[2];

        statement += "(\"" + name + "\", \"" + password + "\", \"" + email + "\", STR_TO_DATE('" + birthDate + "', '%d/%m/%Y')),\r\n";
    }


    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillRecipes(amount) {
    let userIds;
    await mysql.queryStatement("Select ID from User")
        .then((result) => {
            userIds = result;
        })

    let statement = "USE sql_recipes;\r\n" +
        "INSERT INTO Recipe (Name, Description, ImageURL, Created, UserID)\r\n VALUES";
    for (let i = 0; i < amount; ++i) {
        let name = "Recipe " + Math.ceil(Math.random() * 1000000);
        let description = "Lorem ipsum " + Math.ceil(Math.random() * 1000000);
        let imageURL = "URL " + Math.ceil(Math.random() * 1000000);
        let created = randomDate(new Date(2019, 1, 1), new Date());
        let userID = userIds[Math.floor(Math.random() * (userIds.length - 1))].ID;

        statement += "(\"" + name + "\", \"" + description + "\", \"" + imageURL + "\", STR_TO_DATE('" + created.getDate() + "/" + (created.getMonth() + 1) + "/" + created.getFullYear() + "', '%d/%m/%Y'), " + userID + "),\r\n";
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillMealPlans(amount) {
    let userIds;
    await mysql.queryStatement("Select ID from User")
        .then((result) => {
            userIds = result;
        })

    let statement = "USE sql_recipes;\r\n" +
        "INSERT INTO MealPlan (Name, Description, Created, UserID)\r\n VALUES";
    for(let i = 0; i < amount; ++i) {
        let name = "Meal-Plan " + Math.ceil(Math.random() * 1000000);
        let description = "Lorem ipsum " + Math.ceil(Math.random() * 1000000);
        let created = randomDate(new Date(2019, 1, 1), new Date());
        let userID = userIds[Math.floor(Math.random() * (userIds.length - 1))].ID;

        statement += "(\"" + name + "\", \"" + description + "\", STR_TO_DATE('" + created.getDate() + "/" + (created.getMonth() + 1) + "/" + created.getFullYear() + "', '%d/%m/%Y'), " + userID + "),\r\n";
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

function fillProperties() {
    let file = fs.readFileSync("./sql/Properties.csv").toString();
    file = file.replace('\r\n', '\n');
    let fileArray = file.split("\n");

    let statement = "USE sql_recipes;\r\n" +
        "INSERT INTO Property (Name, Description)\r\n VALUES";
    for (let i = 0; i < fileArray.length; ++i) {
        let rowData = fileArray[i].split(";");

        let name = rowData[0];
        let description = rowData[1];

        statement += "(\"" + name + "\", \"" + description + "\"),\r\n";
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillPreparationSteps() {
    let recipeIds = await mysql.queryStatement("Select ID from Recipe");

    let statement = "";
    for(let i = 0; i < recipeIds.length; ++i) {
        if(i % 10000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "USE sql_recipes;\r\n" +
                "INSERT INTO PreparationStep (RecipeID, StepNumber, Description, Duration)\r\n VALUES";
        }
        let recipeId = recipeIds[i].ID;

        for(let j = 0, k = Math.ceil(Math.random() * 4); j < k; ++j) {
            let stepNumber = j;
            let description = "Preparation Step of Recipe " + recipeId + " Step no " + stepNumber;
            let duration = Math.ceil(Math.random() * 60);

            statement += "(" + recipeId + ", " + stepNumber + ", \"" + description + "\", " + duration + "),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillRecipeIngredients() {
    let recipeIds = await mysql.queryStatement("Select ID from Recipe");
    let ingredientIds = await mysql.queryStatement("Select ID from Ingredient");

    let statement = "";
    for(let i = 0; i < recipeIds.length; ++i) {
        if(i % 5000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "USE sql_recipes;\r\n" +
                "INSERT IGNORE INTO RecipeIngredients (RecipeID, IngredientID, Gramms)\r\n VALUES";
        }
        for(let j = 0, k = Math.ceil(Math.random() * 4) + 1; j < k; ++j) {
            let recipeId = recipeIds[i].ID;
            let ingredientId = ingredientIds[Math.floor(Math.random() * ingredientIds.length)].ID;
            let gramms = Math.floor(Math.random() * 1000) + 1;

            statement += "(" + recipeId + ", " + ingredientId + ", " + gramms + "),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillUserRecipeLibs() {
    let userIds = await mysql.queryStatement("Select ID from User");
    let recipeIds = await mysql.queryStatement("Select ID from Recipe");

    let statement = "";
    for(let i = 0; i < userIds.length; ++i) {
        if(i % 4000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "Use sql_recipes;\r\n" +
                "INSERT IGNORE INTO UserRecipeLib (userId, recipeId, since) \r\n VALUES";
        }
        for(let j = 0, k = Math.ceil(Math.random() * 11); j < k; ++j) {
            let userId = userIds[i].ID;
            let recipeId = recipeIds[Math.floor(Math.random() * recipeIds.length)].ID;
            let since = randomDate(new Date(2020, 5, 1), new Date());

            statement += "(" + userId + ", " + recipeId + ", STR_TO_DATE('" + since.getDate() + "/" + (since.getMonth() + 1) + "/" + since.getFullYear() + "', '%d/%m/%Y')),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillUserMealPlanLibs() {
    let userIds = await mysql.queryStatement("Select ID from User");
    let mealPlanIds = await mysql.queryStatement("Select ID from MealPlan");

    let statement = "";
    for(let i = 0; i < userIds.length; ++i) {
        if(i % 5000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "Use sql_recipes;\r\n" +
                "INSERT IGNORE INTO UserMealPlanLib (UserID, MealPlanID, Since)\r\n VALUES";
        }
        for(let j = 0, k = Math.ceil(Math.random() * 5); j < k; ++j) {
            let userId = userIds[i].ID;
            let mealPlanId = mealPlanIds[Math.floor(Math.random() * mealPlanIds.length)].ID;
            let since = randomDate(new Date(2020, 5, 1), new Date());

            statement += "(" + userId + ", " + mealPlanId + ", STR_TO_DATE('" + since.getDate() + "/" + (since.getMonth() + 1) + "/" + since.getFullYear() + "', '%d/%m/%Y')),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillMealPlanRecipes() {
    let mealPlanIds = await mysql.queryStatement("Select ID from MealPlan");
    let recipeIds = await mysql.queryStatement("Select ID from Recipe");

    let statement = "Use sql_recipes;\r\n" +
        "INSERT IGNORE INTO MealPlanRecipes (MealPlanID, RecipeID)\r\n VALUES";
    for(let i = 0; i < mealPlanIds.length; ++i) {
        for(let j = 0, k = Math.ceil(Math.random() * 6); j < k; ++j) {
            let mealPlanId = mealPlanIds[i].ID;
            let recipeId = recipeIds[Math.floor(Math.random() * recipeIds.length)].ID;

            statement += "(" + mealPlanId + ", " + recipeId + "),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillMealPlanProperties() {
    let mealPlanIds = await mysql.queryStatement("Select ID from MealPlan");
    let propertyIds = await mysql.queryStatement("Select ID from Property");

    let statement = "";
    for(let i = 0; i < mealPlanIds.length; ++i) {
        if(i % 5000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "Use sql_recipes;\r\n" +
                "INSERT IGNORE INTO MealPlanProperties (MealPlanID, PropertyID)\r\n VALUES";
        }
        for(let j = 0, k = Math.ceil(Math.random() * 4); j < k; ++j) {
            let mealPlanId = mealPlanIds[i].ID;
            let propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)].ID;

            statement += "(" + mealPlanId + ", " + propertyId + "),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

async function fillFollows() {
    let userIds = await mysql.queryStatement("Select ID from User");

    let statement = "";
    for(let i = 0; i < userIds.length; ++i) {
        if(i % 5000 === 0) {
            if(i !== 0) {
                statement = statement.substring(0, statement.length - 3);
                console.log(statement);
                await mysql.queryStatement(statement);
            }
            statement = "Use sql_recipes;\r\n" +
                "INSERT IGNORE INTO Follows (UserID, Follows)\r\n VALUES";
        }
        for(let j = 0, k = Math.ceil(Math.random() * 10); j < k; ++j) {
            let userId = userIds[i].ID;
            let follows = userIds[Math.floor(Math.random() * userIds.length)].ID;

            statement += "(" + userId + ", " + follows + "),\r\n";
        }
    }

    statement = statement.substring(0, statement.length - 3);
    console.log(statement);
    return mysql.queryStatement(statement);
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

module.exports.fillIngredients = fillIngredients;
module.exports.fillUsers = fillUsers;
module.exports.fillRecipes = fillRecipes;
module.exports.fillMealPlans = fillMealPlans;
module.exports.fillProperties = fillProperties;
module.exports.fillPreparationSteps = fillPreparationSteps;
module.exports.fillRecipeIngredients = fillRecipeIngredients;
module.exports.fillUserRecipeLibs = fillUserRecipeLibs;
module.exports.fillUserMealPlanLibs = fillUserMealPlanLibs;
module.exports.fillMealPlanRecipes = fillMealPlanRecipes;
module.exports.fillMealPlanProperties = fillMealPlanProperties;
module.exports.fillFollows = fillFollows;
