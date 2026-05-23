const { fn, col } = require("sequelize");
const Review  = require("../models/review");
const Company = require("../models/company");
const User    = require("../models/user");
const createReview = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "فقط العملاء يمكنهم إضافة تقييمات" });
    }
    const { companyId, projectId, rating, comment } = req.body;
    if (!companyId || !rating) {
      return res.status(400).json({ message: "معرف الشركة والتقييم مطلوبان" });
    }
    const where = { client_id: req.user.id, company_id: companyId };
    if (projectId) where.project_id = projectId;
    const existing = await Review.findOne({ where });
    if (existing) {
      return res.status(409).json({ message: "لقد قمت بتقييم هذه الشركة مسبقاً" });
    }
    const review = await Review.create({
      rating,
      comment:    comment    || null,
      client_id:  req.user.id,
      company_id: companyId,
      project_id: projectId  || null
    });
    const avg = await Review.findOne({
      where: { company_id: companyId },
      attributes: [[fn("AVG", col("rating")), "avgRating"]]
    });
    const newRating = avg && avg.dataValues.avgRating
      ? parseFloat(parseFloat(avg.dataValues.avgRating).toFixed(2))
      : 0;
    await Company.update({ rating: newRating }, { where: { id: companyId } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { company_id: req.params.companyId },
      include: [
        {
          model: User,
          as: "Client",
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { createReview, getCompanyReviews };