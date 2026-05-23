const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Company = require("./company");
const Project = require("./project");
const Review = sequelize.define("Review", {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});
Review.belongsTo(User,    { foreignKey: "client_id",  as: "Client" });
Review.belongsTo(Company, { foreignKey: "company_id", as: "Company" });
Review.belongsTo(Project, { foreignKey: "project_id", as: "Project", constraints: false });
User.hasMany(Review,    { foreignKey: "client_id" });
Company.hasMany(Review, { foreignKey: "company_id" });
Review.addHook("afterCreate", async (review) => {
  const { fn, col } = require("sequelize");
  const avg = await Review.findOne({
    where: { company_id: review.company_id },
    attributes: [[fn("AVG", col("rating")), "avgRating"]]
  });
  const newRating = avg && avg.dataValues.avgRating ? parseFloat(avg.dataValues.avgRating) : 0;
  await Company.update({ rating: newRating }, { where: { id: review.company_id } });
});
module.exports = Review;