const { DataTypes } = require("sequelize");
const sequelize     = require("../config/db");
const Company       = require("./company");
const PortfolioItem = sequelize.define("PortfolioItem", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { timestamps: true });
Company.hasMany(PortfolioItem, { foreignKey: "company_id", as: "Portfolio", onDelete: "CASCADE" });
PortfolioItem.belongsTo(Company, { foreignKey: "company_id", as: "Company" });
module.exports = PortfolioItem;