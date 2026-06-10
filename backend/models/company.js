const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Company = sequelize.define("Company", {
  ownerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      "full_construction",
      "partial_construction",
      "materials_supplier"
    ),
    allowNull: false
  },
  commercialRegistrationNumber: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: { isNumeric: true }
  },
  vatNumber: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: { isNumeric: true }
  },
  establishmentNumber: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: { isNumeric: true }
  },
  commercialRegistrationFile: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coverPhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specializations: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  projectsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: "الرياض"
  },
  approvalStatus: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending"
  },
  approvalNote: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deleteRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleteRequestNote: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categories: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});
User.hasOne(Company, { foreignKey: "user_id" });
Company.belongsTo(User, { foreignKey: "user_id" });
module.exports = Company;