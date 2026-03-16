const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostWatch = sequelize.define(
  "PostWatch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    watchedTime: {
      type: DataTypes.STRING, // store time in MM:SS format
      defaultValue: "00:00",
    },

    rewarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"], // prevents claiming twice
      },
    ],
  }
);

module.exports = PostWatch;