const mongoClient = require("mongodb").MongoClient
const database_url = "mongodb://root:password@mongo:27017/";
const database_name = "mongo_recipes"

function initCollections() {
    return new Promise((resolve, reject) => {
        mongoClient.connect(database_url, (error, db) => {
            if (error) {
                console.log("Error: " + error)
                reject(error)
            }
            const db_object = db.db(database_name)

            // Delete previous database if one exists
            db_object.dropDatabase(function (err, res) {
                if (err) reject(err)
            })
            // Create indices
            db_object.collection("Recipe").createIndex({Name: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("Recipe").createIndex({Created: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("MealPlan").createIndex({Name: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("MealPlan").createIndex({Created: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("User").createIndex({Name: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("User").createIndex({BirthDate: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("User").createIndex({MealPlanLib: 1}, function (err, res) {
                if (err) reject(err)
            })
            db_object.collection("Ingredient").createIndex({Name: 1}, function (err, res) {
                if (err) reject(err)
            })

            db.close()
            resolve()
        })
    })
}

function queryData(collectionName, query1, query2) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(database_url, (error, db) => {
            if (error) {
                console.log("Error: " + error)
                reject(error)
            }
            db.db(database_name).collection(collectionName).find(query1, query2).toArray().then(res => {
                resolve(res)
            })
        })
    });
}

function insertDocuments(data, name) {
    mongoClient.connect(database_url, (error, db) => {
        if (error) {
            console.log("Error: " + error)
        }
        db.db(database_name).collection(name).insertMany(data, (err, res) => {
            if (err) console.log("error: " + err)
            db.close()
        })
    })
}

function insertDocument(data, name) {
    mongoClient.connect(database_url, (error, db) => {
        if (error) {
            console.log("Error: " + error)
        }
        db.db(database_name).collection(name).insertOne(data, (err, res) => {
            if (err) console.log("error: " + err)
            db.close()
        })
    })
}

function addRecipe(data) {
    mongoClient.connect(database_url, (error, db) => {
        if (error) {
            console.log("Error: " + error)
        }

        db.db(database_name).collection("User").findOne({Name: data.username}).then(res => {
            let recipe = {
                UserID: res._id,
                Name: data.recipeName,
                Description: data.description,
                ImageURL: data.imageURL,
                Created: new Date()
            }
            return insertDocument(recipe, "Recipe")
        })
    })
}

async function addIngredient(ingredient) {
    return await mongoClient.connect(database_url, (error, db) => {
        let insertIngredient = {
            Name: ingredient.name,
            Producer: ingredient.producer,
            Kcal: ingredient.kcal,
            Carbs: ingredient.carbs,
            Fat: ingredient.fat,
            Protein: ingredient.protein
        }
        insertDocument(insertIngredient, "Ingredient");
    })
}

function getMealPlansRecipesReport() {
    let hrstart = process.hrtime();
    return new Promise((resolve, reject) => {
        mongoClient.connect(database_url, (error, db) => {
            if (error) {
                console.log("Error: " + error)
                reject(error)
            }

            let thisYear = new Date().getFullYear()
            let createdLimit = new Date()
            let birthDateLimit = new Date()

            createdLimit.setFullYear(thisYear - 1)
            birthDateLimit.setFullYear(thisYear - 30)

            db.db(database_name).collection("Recipe").aggregate([
                {$lookup: {"from": "User", "localField": "UserID", "foreignField": "_id", "as": "User"}},
                {$match: {"User.BirthDate": {$gte: birthDateLimit}}},
                {$project: {Name: 1, Description: 1, UserName: {$arrayElemAt: ["$User.Name", 0]}, Created: 1}},
                {$unionWith: {
                        coll: "MealPlan",
                        pipeline: [
                            {$lookup: {"from": "User", "localField": "UserID", "foreignField": "_id", "as": "User"}},
                            {$match: {"User.BirthDate": {$gte: birthDateLimit}}},
                            {$project: {Name: 1, Description: 1, UserName: {$arrayElemAt: ["$User.Name", 0]}, Created: 1}}
                        ]
                    }
                },
                {$match: {Created: {$gte: createdLimit}}},
                {$sort: {Name: 1}}
            ]).toArray().then(res => {
                let hrend = process.hrtime(hrstart);
                console.log('Mongo R1: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
                resolve(res)
            })
        })
    })
}

async function getPropertiesReport() {
    let birthDateLimit = new Date();
    birthDateLimit.setFullYear(birthDateLimit.getFullYear() - 60);
    let sinceDateLimit = new Date();
    sinceDateLimit.setFullYear(sinceDateLimit.getFullYear() - 1);

    let hrstart = process.hrtime();
    let data = await new Promise((resolve, reject) => {
        mongoClient.connect(database_url, (error, db) => {
            db.db(database_name).collection("User").aggregate([
                { $match: {'BirthDate': { $lte: birthDateLimit } } },
                { $project: {
                        MealPlanLib: {
                            $filter: {
                                input: '$MealPlanLib',
                                as: 'lib',
                                cond: { $gte: ['$$lib.Since', sinceDateLimit] }
                            }
                        }
                    }
                },
                { $project: {'_id': 0, 'MealPlanLib.Since': 0 } },
                { $unwind: '$MealPlanLib'},
                { $project: {'MealPlanID': '$MealPlanLib.MealPlanID' } },
                { $group : {
                        '_id': '$MealPlanID',
                        'amount': { '$sum': 1 }
                    }
                },
                { $lookup: {
                        from: 'MealPlan',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'MealPlans'
                    }
                },
                { $unwind: '$MealPlans' },
                { $project: { 'Properties': '$MealPlans.Properties', 'Amount': '$amount' } },
                { $unwind: '$Properties' },
                { $group : {
                        '_id': '$Properties.Name',
                        'Amount': { '$sum': '$Amount' }
                    }
                },
                { $project: {'Name': '$_id', 'Amount': '$Amount'} },
                { $match: {'_id' : { $ne: null } } },
                { $sort: { 'Amount': -1 } }
            ]).toArray().then(res => {
                resolve(res);
            });
        });
    });
    let hrend = process.hrtime(hrstart);
    console.log('Mongo R2: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    return data;
}

module.exports.initCollections = initCollections
module.exports.queryData = queryData
module.exports.insertDocuments = insertDocuments
module.exports.insertDocument = insertDocument
module.exports.addRecipe = addRecipe
module.exports.addIngredient = addIngredient
module.exports.getMealPlansRecipesReport = getMealPlansRecipesReport
module.exports.getPropertiesReport = getPropertiesReport
