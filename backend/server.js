require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(async () => {
    // Fix: ensure imageUrl column in Products table is TEXT (not VARCHAR 255)
    try {
      await sequelize.query(`ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`);
      console.log("✅ Products.imageUrl → TEXT");
    } catch (_) { /* already TEXT, skip */ }
    app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
  })
  .catch(err => console.error("❌ خطأ:", err));
