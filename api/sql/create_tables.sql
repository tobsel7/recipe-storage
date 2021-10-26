CREATE DATABASE IF NOT EXISTS sql_recipes;
USE sql_recipes;

CREATE TABLE Ingredient (
	ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Producer varchar(255),
    Kcal float Check(Kcal >= 0 AND Kcal < 1000),
    Carbs float Check(Carbs >= 0),
    Fat float Check(Fat >= 0),
    Protein float Check(Protein >= 0),
    CONSTRAINT Ingredient_ID_Primary PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS User (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Password varchar(50) NOT NULL Check(CHAR_LENGTH(Password) >= 8),
    EmailAddress varchar(255) NOT NULL,
    BirthDate date NOT NULL Check(BirthDate > STR_TO_DATE('1.1.1903', '%d.%m.%Y')),
    CONSTRAINT User_ID_Primary PRIMARY KEY (ID),
	CONSTRAINT User_Name_Unique UNIQUE(Name),
	CONSTRAINT User_EmailAddress_Unique UNIQUE(EmailAddress)
);

CREATE TABLE IF NOT EXISTS Recipe (
	ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Description varchar(1000),
    ImageURL varchar(255),
    Created date NOT NULL,
    UserID int NOT NULL,
    CONSTRAINT Recipe_ID_Primary PRIMARY KEY (ID),
    CONSTRAINT Recipe_UserID_Foreign FOREIGN KEY (UserID) REFERENCES User(ID)
);

CREATE TABLE IF NOT EXISTS MealPlan (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Description varchar(1000),
	Created date NOT NULL,
    UserID int NOT NULL,
    CONSTRAINT MealPlan_ID_Priamry PRIMARY KEY (ID),
    CONSTRAINT MealPlan_UserID_Foreign FOREIGN KEY (UserID) REFERENCES User(ID)
);

CREATE TABLE IF NOT EXISTS Property (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    Description varchar(1000),
    CONSTRAINT Property_ID_Primary PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS PreparationStep (
	RecipeID int NOT NULL,
    StepNumber int NOT NULL,
    Description varchar(1000),
    Duration int CHECK(Duration >= 0),
    CONSTRAINT PreparationStep_RecipeIDStepNumber_Primary PRIMARY KEY (RecipeID, StepNumber),
    CONSTRAINT PreparationStep_RecipeID_Foreign FOREIGN KEY (RecipeID) REFERENCES Recipe(ID)
);

CREATE TABLE IF NOT EXISTS RecipeIngredients (
	RecipeID int NOT NULL,
	IngredientID int NOT NULL,
    Gramms int CHECK(Gramms > 0),
    CONSTRAINT RecipeIngredients_RecipeIDIngredientID_Primary PRIMARY KEY (RecipeID, IngredientID),
    CONSTRAINT RecipeIngredients_RecipeID_Foreign FOREIGN KEY (RecipeID) REFERENCES Recipe(ID),
    CONSTRAINT RecipeIngredients_IngredientID_Foreign FOREIGN KEY (IngredientID) REFERENCES Ingredient(ID)
);

CREATE TABLE IF NOT EXISTS UserRecipeLib (
	UserID int NOT NULL,
    RecipeID int NOT NULL,
    Since Date CHECK(Since > STR_TO_DATE('01-05-2020', '%d-%m-%Y')),
    CONSTRAINT UserRecipeLibs_UserIDRecipeID_Primary PRIMARY KEY (UserID, RecipeID),
    CONSTRAINT UserRecipeLibs_UserID_Foreign FOREIGN KEY (UserID) REFERENCES User(ID),
    CONSTRAINT UserRecipeLibs_RecipeID_Foreign FOREIGN KEY (RecipeID) REFERENCES Recipe(ID)
);

CREATE TABLE IF NOT EXISTS UserMealPlanLib (
	UserID int NOT NULL,
    MealPlanID int NOT NULL,
    Since Date CHECK(Since > STR_TO_DATE('01-05-2020', '%d-%m-%Y')),
    CONSTRAINT UserMealPlanLibs_UserIDMealPlanID_Primary PRIMARY KEY (UserID, MealPlanID),
    CONSTRAINT UserMealPlanLibs_UserID_Foreign FOREIGN KEY (UserID) REFERENCES User(ID),
    CONSTRAINT UserMealPlanLibs_MealPlanID_Foreign FOREIGN KEY (MealPlanID) REFERENCES MealPlan(ID)
);

CREATE TABLE IF NOT EXISTS MealPlanRecipes (
	MealPlanID int NOT NULL,
    RecipeID int NOT NULL,
    CONSTRAINT MealPlanRecipes_MealPlanIDRecipeID_Primary PRIMARY KEY (MealPlanID, RecipeID),
    CONSTRAINT MealPlanRecipes_MealPlanID_Foreign FOREIGN KEY (MealPlanID) REFERENCES MealPlan(ID),
    CONSTRAINT MealPlanRecipes_RecipeID_Foreign FOREIGN KEY (RecipeID) REFERENCES Recipe(ID)
);

CREATE TABLE IF NOT EXISTS MealPlanProperties (
	MealPlanID int NOT NULL,
    PropertyID int NOT NULL,
    CONSTRAINT MealPlanProperties_MealPlanIDPropertyID_Primary PRIMARY KEY (MealPlanID, PropertyID),
    CONSTRAINT MealPlanProperties_MealPlanID_Foreign FOREIGN KEY (MealPlanID) REFERENCES MealPlan(ID),
    CONSTRAINT MealPlanProperties_PropertyID_Foreign FOREIGN KEY (PropertyID) REFERENCES Property(ID)
);

CREATE TABLE IF NOT EXISTS Follows (
	UserID int NOT NULL,
	Follows int NOT NULL,
	CONSTRAINT Follows_UserIDFollows_Primary PRIMARY KEY(UserID, Follows),
	CONSTRAINT Follows_UserID_Foreign FOREIGN KEY (UserID) REFERENCES User(ID),
	CONSTRAINT Follows_Follows_Foreign FOREIGN KEY (Follows) REFERENCES User(ID)
);
