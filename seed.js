const { Sequelize } = require("sequelize");
const sequelize = require("./config/db");
const User = require("./models/User");
const Role = require("./models/role");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    // Disable foreign key checks temporarily
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

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

    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "12345678",
      roleId: adminRole.id,
    });

    console.log("Database seeded successfully");

    // Re-enable foreign key checks after sync
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
