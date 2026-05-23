const Favorite = require("../models/favorite");
const Product  = require("../models/product");
const Company  = require("../models/company");
exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId مطلوب" });
    const existing = await Favorite.findOne({
      where: { user_id: req.user.id, product_id: productId }
    });
    if (existing) {
      await existing.destroy();
      return res.json({ status: "removed", favorited: false });
    }
    await Favorite.create({ user_id: req.user.id, product_id: productId });
    res.json({ status: "added", favorited: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Product,
        include: [{
          model: Company,
          attributes: ["id", "ownerName", "city", "coverPhoto"]
        }]
      }],
      order: [["createdAt", "DESC"]]
    });
    const products = favorites.map(f => f.Product).filter(Boolean);
    res.json({ status: "success", data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getFavoriteIds = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      attributes: ["product_id"]
    });
    res.json({ data: favorites.map(f => f.product_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};