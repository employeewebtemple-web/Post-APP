const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  media: {
    type: DataTypes.STRING,
    allowNull: true   // image path
  },

  link: {
    type: DataTypes.STRING,
    allowNull: true   // youtube/video link
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  watchTime: {
  type: DataTypes.STRING, // store time in MM:SS format
  defaultValue: "00:00",
},

  totalUsersWatched: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }

}, {
  timestamps: true
});

module.exports = Post;