require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(async () => {
    try {
      await sequelize.query(`ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`);
      console.log("✅ Products.imageUrl → TEXT");
    } catch (_) { /* already TEXT, skip */ }

    // Only listen if not running on Vercel (serverless)
    if (process.env.VERCEL !== "1") {
      app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
    }
  })
  .catch(err => console.error("❌ خطأ:", err));

module.exports = app;
