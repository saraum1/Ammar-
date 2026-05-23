require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

let dbReady = false;
let dbError = null;

const dbInit = sequelize.sync({ force: false })
  .then(async () => {
    try {
      await sequelize.query(`ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`);
    } catch (_) {}
    dbReady = true;
    console.log("✅ DB ready");
  })
  .catch(err => {
    dbError = err;
    console.error("❌ DB error:", err.message);
  });

// Middleware: wait for DB before handling any request
app.use(async (req, res, next) => {
  if (!dbReady) {
    try { await dbInit; } catch (_) {}
  }
  if (dbError) {
    return res.status(500).json({ error: "DB connection failed", details: dbError.message });
  }
  next();
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
}

module.exports = app;
