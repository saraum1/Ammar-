const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Note = sequelize.define("Note", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phase: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

User.hasMany(Note, { foreignKey: "user_id" });
Note.belongsTo(User, { foreignKey: "user_id" });

module.exports = Note;
