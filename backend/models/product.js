const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Company = require("./company");
const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: "وحدة"
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});
Company.hasMany(Product, { foreignKey: "company_id" });
Product.belongsTo(Company, { foreignKey: "company_id" });
module.exports = Product;