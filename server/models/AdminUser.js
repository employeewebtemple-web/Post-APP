// models/Admin.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "admin",
  },
}, {
  tableName: "admins",
  timestamps: true,
});

module.exports = Admin;