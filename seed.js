const { Sequelize } = require("sequelize");
const sequelize = require("./config/db");
const User = require("./models/User");
const Role = require("./models/role");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Use force: true to drop and recreate tables
    const adminRole = await Role.create({
      name: "Administrator",
      permissions: {
        discount: true,
        modifyPrice: true,
        closeSession: true,
        viewTransactions: true,
        searchTransactions: true,
        modifyTransactions: true,
        deleteTransactions: true,
        reportsModule: true,
        articlesModule: true,
        stockModule: true,
        settingsModule: true,
        userSettings: true,
        caisseModule: true,
      },
    });
    const cashierRole = await Role.create({
      name: "Cashier",
      permissions: {
        discount: false,
        modifyPrice: false,
        closeSession: false,
        viewTransactions: false,
        searchTransactions: false,
        modifyTransactions: false,
        deleteTransactions: false,
        reportsModule: false,
        articlesModule: false,
        stockModule: false,
        settingsModule: false,
        userSettings: false,
        caisseModule: true,
      },
    });
    const managerRole = await Role.create({
      name: "Manager",
      permissions: {
        discount: true,
        modifyPrice: true,
        closeSession: true,
        viewTransactions: true,
        searchTransactions: true,
        modifyTransactions: false,
        deleteTransactions: false,
        reportsModule: true,
        articlesModule: true,
        stockModule: true,
        settingsModule: false,
        userSettings: false,
        caisseModule: true,
      },
    });

    const hashedPassword = await bcrypt.hash("12345678", 10);
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      roleId: adminRole.id,
    });

    console.log("Database seeded successfully");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();