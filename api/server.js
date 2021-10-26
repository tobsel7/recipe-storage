const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("./MysqlDatabase")
const mongoDB = require("./MongoDatabase")
const migrator = require("./Migrator")
const fillingScript = require("./sql/DBFillingScript")
const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

port = process.env.PORT || "8000"

function getUsedDB(request) {
    if(request.params.db === "mysql") {
        return mysql;
    } else if(request.params.db === "mongo"){
        return mongoDB;
    } else {
        throw "Database not found";
    }
}

app.get("/", (request, response) => {
    response.json({Running: "true"})
})

app.get("/api/mysql/create", async (request, response) => {
    try {
        let json = await execute(mysql.createTables);
        response.json(json);
    } catch (err) {
        response.json(err);
        console.log(err);
    }
})

app.get("/api/mysql/drop", async (request, response) => {
    try {
        let json = await execute(mysql.dropTables);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/migration", async (request, response) => {
    try {
        let json = await execute(migrator.migrate);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

// Report 1: Properties
app.get("/api/:db/propertiesReport", async (request, response) => {
    let usedDB;
    try {
        usedDB = getUsedDB(request);
    } catch (ex) {
        return;
    }


    usedDB.getPropertiesReport()
        .then(function(result) {
            response.json(JSON.parse(JSON.stringify(result)))
        }).catch(err => {
            console.log(err);
        })
})

// Report 2: meal plans and recipes
app.get("/api/mysql/mealplansRecipes", async (request, response) => {
        mysql.getMealPlansRecipesReport()
            .then(function(result) {
                response.json(JSON.parse(JSON.stringify(result)))
            }).catch(err => {
                console.log(err);
            })
})

app.get("/api/mongo/mealplansRecipes", async (request, response) => {
    mongoDB.getMealPlansRecipesReport()
        .then(function(result) {
            response.json(JSON.parse(JSON.stringify(result)))
        }).catch(err => {
            console.log(err);
        })
})

// Use case 1: Add a new ingredient
app.post("/api/:db/addIngredient", async (request, response) => {
    let usedDB;
    try {
        usedDB = getUsedDB(request);
    } catch (ex) {
        return;
    }

    await usedDB.addIngredient(request.body)
        .then(() => {
            response.json({"Message" : "Successfully added the Ingredient"})
        }).catch(err => {
            console.log(err)
            response.json({"Message": err.message});
        });
})

// Use case 2: Add a new recipe
app.post("/api/:db/recipe", async (request, response) => {
    try {
        if (request.params.db === "mysql") {
            let json = execute(function () {
                return mysql.addRecipe(request.body)
            })
            response.json(json)
        } else {
            mongoDB.addRecipe(request.body)
            response.json({status : 200});
        }
    } catch (err) {
        console.log(err)
        response.json( {
            "Message" : err.message
        })
    }
})


// Use case 2: Add ingredient
app.post("/api/:db/recipeIngredients", async (request, response) => {
    console.log("Getting request")
    try {
        let json = execute(function() {
            if (request.params.db === "mysql") {
                return mysql.addRecipeIngredients(request.body)
            } else {
                return mongoDB.insertDocument(request.body)
            }
        })
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/ingredients", async (request, response) => {
    try {
        let json = execute(mysql.getIngredients);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mongo/ingredients", async (request, response) => {
    try {
        let ingredients = await mongoDB.queryData("Ingredient", "")
        response.json(ingredients)
    } catch(err) {
        response.error()
    }

})

app.get("/api/mysql/fill", async (request, response) => {
    try {
        let json = {
            "droppedTables" : await execute(mysql.dropTables),
            "createdTables" : await execute(mysql.createTables),
            "FilledIngredients" : await executeFill(fillingScript.fillIngredients, 25000),
            "FilledUsers" : await executeFill(fillingScript.fillUsers, 25000),
            "FilledRecipes" : await executeFill(fillingScript.fillRecipes, 25000),
            "FilledMealPlans" : await executeFill(fillingScript.fillMealPlans, 25000),
            "FilledProperties" : await execute(fillingScript.fillProperties),
            "FilledPreparationSteps" : await execute(fillingScript.fillPreparationSteps),
            "FilledRecipeIngredients" : await execute(fillingScript.fillRecipeIngredients),
            "FilledUserRecipeLibs" : await execute(fillingScript.fillUserRecipeLibs),
            "FilledUserMealPlanLibs" : await execute(fillingScript.fillUserMealPlanLibs),
            "FilledMealPlanRecipes" : await execute(fillingScript.fillMealPlanRecipes),
            "FilledMealPlanProperties" : await execute(fillingScript.fillMealPlanProperties),
            "FilledFollows" : await execute(fillingScript.fillFollows)
        };
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillIngredients", async (request, response) => {
    try {
        let json = await executeFill(fillingScript.fillIngredients, 500);
        response.json(json);
    } catch (err) {
        console.log(err);
    }

})

app.get("/api/mysql/fillUsers", async (request, response) => {
    try {
        let json = await executeFill(fillingScript.fillUsers, 300);
        response.json(json);
    } catch (err) {
        console.log(err);
    }

})

app.get("/api/mysql/fillRecipes", async (request, response) => {
    try {
        let json = await executeFill(fillingScript.fillRecipes, 200);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillMealPlans", async (request, response) => {
    try {
        let json = await executeFill(fillingScript.fillMealPlans, 100);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillProperties", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillProperties);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillPreparationSteps", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillPreparationSteps);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillRecipeIngredients", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillRecipeIngredients);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillUserRecipeLibs", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillUserRecipeLibs);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillUserMealPlanLibs", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillUserMealPlanLibs);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillMealPlanRecipes", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillMealPlanRecipes);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillMealPlanProperties", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillMealPlanProperties);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

app.get("/api/mysql/fillFollows", async (request, response) => {
    try {
        let json = await execute(fillingScript.fillFollows);
        response.json(json);
    } catch (err) {
        console.log(err);
    }
})

function execute(executeFunction) {
    return new Promise((resolve, reject) => {
        executeFunction()
            .then(() => {
                resolve({
                    "success" : true
                });
            })
            .catch(err => {
                reject({
                    "success" : false,
                    "error" : err.message
                });
            });
    })
}

function executeFill(executeFunction, amount) {
    return new Promise((resolve, reject) => {
        executeFunction(amount)
            .then(() => {
                resolve( {
                    "success" : true
                });
            }).catch((err) => {
                reject({
                    "success": false,
                    "error": err.message
                });
            });
    })
}

app.get("/api/mongo/:collection", async (request, response) => {
    try {
        let collection = request.params.collection
        let data = await mongoDB.queryData(collection, {}, {ID:0})
        response.json(data)
        console.log(data);
    } catch(err) {
        response.error()
    }
})

app.listen(port, () =>  {
    console.log("Running on port " + port + ".");
})