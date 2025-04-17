const User = require("./models/User");
const Role = require("./models/role");
const Article = require("./models/Articles");
const Category = require("./models/Category");
const StockEntry = require("./models/StockEntry");
const StockExit = require("./models/StockExit");
const Settings = require("./models/Settings"); // Add the Settings model

const setupAssociations = () => {
  // User and Role
  User.belongsTo(Role, { foreignKey: "roleId", as: "Role" });
  Role.hasMany(User, { foreignKey: "roleId" });

  // Article and Category
  Article.belongsTo(Category, { foreignKey: "categorie", as: "Category" });
  Category.hasMany(Article, { foreignKey: "categorie" });

  // StockEntry and Article
  StockEntry.belongsTo(Article, { foreignKey: "articleId", as: "StockEntryArticle" });
  Article.hasMany(StockEntry, { foreignKey: "articleId" });

  // StockExit and Article
  StockExit.belongsTo(Article, { foreignKey: "articleId", as: "StockExitArticle" });
  Article.hasMany(StockExit, { foreignKey: "articleId" });

  // No associations for Settings (it’s standalone for now)
};

module.exports = setupAssociations;