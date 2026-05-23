const PortfolioItem = require("../models/portfolioItem");
const Company       = require("../models/company");
const fs            = require("fs");
const path          = require("path");
exports.getCompanyPortfolio = async (req, res) => {
  try {
    const items = await PortfolioItem.findAll({
      where: { company_id: req.params.id },
      order: [["year", "DESC"], ["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMyPortfolio = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const items = await PortfolioItem.findAll({
      where: { company_id: company.id },
      order: [["year", "DESC"], ["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addPortfolioItem = async (req, res) => {
  try {
    const { title, description, year, category } = req.body;
    if (!title?.trim())
      return res.status(400).json({ message: "عنوان العمل مطلوب" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const image = req.file ? `/uploads/portfolio/${req.file.filename}` : null;
    const item = await PortfolioItem.create({
      title:       title.trim(),
      description: description?.trim() || null,
      year:        year ? Number(year) : null,
      category:    category?.trim() || null,
      image,
      company_id:  company.id
    });
    res.status(201).json({ status: "success", data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updatePortfolioItem = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const item = await PortfolioItem.findOne({ where: { id: req.params.id, company_id: company.id } });
    if (!item) return res.status(404).json({ message: "العمل غير موجود" });
    const { title, description, year, category } = req.body;
    if (title       !== undefined) item.title       = title.trim();
    if (description !== undefined) item.description = description.trim() || null;
    if (year        !== undefined) item.year        = year ? Number(year) : null;
    if (category    !== undefined) item.category    = category.trim() || null;
    if (req.file) {
      if (item.image) {
        const old = path.join(__dirname, "..", item.image);
        fs.unlink(old, () => {});
      }
      item.image = `/uploads/portfolio/${req.file.filename}`;
    }
    await item.save();
    res.json({ status: "success", data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deletePortfolioItem = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const item = await PortfolioItem.findOne({ where: { id: req.params.id, company_id: company.id } });
    if (!item) return res.status(404).json({ message: "العمل غير موجود" });
    if (item.image) {
      const imgPath = path.join(__dirname, "..", item.image);
      fs.unlink(imgPath, () => {});
    }
    await item.destroy();
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};