require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

const dbInit = sequelize.sync({ force: false })
  .then(async () => {
    try {
      await sequelize.query(`ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`);
    } catch (_) {}
    console.log("✅ DB ready");
  })
  .catch(err => {
    app.set("dbError", err.message);
    console.error("❌ DB error:", err.message);
  });

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  dbInit.then(() => {
    app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
  });
}

module.exports = app;
