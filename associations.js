const User = require("./models/User");
const Role = require("./models/role");
const Article = require("./models/Articles");
const Category = require("./models/Category");
const StockEntry = require("./models/StockEntry");
const StockExit = require("./models/StockExit");
const Settings = require("./models/Settings");

const Session = require("./models/Session");
const Transaction = require("./models/Transaction");
const Prestation = require("./models/Prestation");
const Facture = require("./models/Facture");

const setupAssociations = () => {
  // ✅ User and Role (User belongs to Role, Role has many Users)
  User.belongsTo(Role, { foreignKey: "roleId", as: "Role" });
  Role.hasMany(User, { foreignKey: "roleId" });

  // ✅ Article and Category (Article belongs to Category, Category has many Articles)
  Article.belongsTo(Category, {
    foreignKey: "categorie",
    as: "category", // alias must match this
  });;
  Category.hasMany(Article, {
    foreignKey: "categorie",
    as: "articles",
  });

  // ✅ StockEntry and Article (StockEntry belongs to Article, Article has many StockEntries)
  StockEntry.belongsTo(Article, { foreignKey: "articleId", as: "StockEntryArticle" });
  Article.hasMany(StockEntry, { foreignKey: "articleId" });

  // ✅ StockExit and Article (StockExit belongs to Article, Article has many StockExits)
  StockExit.belongsTo(Article, { foreignKey: "articleId", as: "StockExitArticle" });
  Article.hasMany(StockExit, { foreignKey: "articleId" });

  // ✅ Session and Transaction (1:N relationship: Session has many Transactions)
  Session.hasMany(Transaction, { foreignKey: "sessionId", as: "transactions" });
  Transaction.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

  // ✅ Session and Prestation (1:1 relationship: Session has one Prestation)
  Session.hasOne(Prestation, { foreignKey: "sessionId", as: "prestation" });
  Prestation.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

  // ✅ Session and Facture (1:N relationship: Session has many Factures)
  Session.hasMany(Facture, { foreignKey: "sessionId", as: "factures" });
  Facture.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

  // ✅ Article and Facture (1:N relationship: Article has many Factures)
  Article.hasMany(Facture, { foreignKey: "articleId", as: "factures" });
  Facture.belongsTo(Article, { foreignKey: "articleId", as: "article" });

  // ℹ️ Settings is standalone (no associations for now)
};

module.exports = setupAssociations;
