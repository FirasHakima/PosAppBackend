const User = require("../models/User");
const Role = require("../models/role");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    const user = await User.create({ name, email, password, roleId });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const users = await User.findAll({
      include: [{ model: Role, as: "Role" }],
    });

    let foundUser = null;
    for (const user of users) {
      if (password == user.password) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: foundUser.id, role: foundUser.Role.name },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: { id: foundUser.id, name: foundUser.name, role: foundUser.Role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validatePin = async (req, res) => {
  try {
    const { pin } = req.body;
    const users = await User.findAll();
    let foundUser = null;
    for (const user of users) {
      if (pin == user.password) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(404).json({ message: "Invalid PIN" });
    }

    res.status(200).json({ message: "PIN validated successfully", userId: foundUser.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: "Role" }],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ roleId });

    const role = await Role.findByPk(roleId);
    if (role) {
      await role.update({ permissions });
    }

    res.status(200).json({ message: "User permissions updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    role.permissions = JSON.stringify(permissions);
    await role.save();
    res.status(200).json({ message: "Role permissions updated successfully", role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};