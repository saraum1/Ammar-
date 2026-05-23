require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

// Initialize DB connection
sequelize.sync({ force: false })
  .then(async () => {
    try {
      await sequelize.query(`ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`);
    } catch (_) { /* already TEXT */ }
    console.log("✅ DB ready");
  })
  .catch(err => console.error("❌ DB error:", err.message));

const PORT = process.env.PORT || 3000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
}

module.exports = app;
