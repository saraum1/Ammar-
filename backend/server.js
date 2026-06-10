require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

// Initialize DB once and cache the promise
const dbInitPromise = sequelize.sync({ force: false })
  .then(async () => {
    const migrations = [
      `ALTER TABLE "Products" ALTER COLUMN "imageUrl" TYPE TEXT`,
      `ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "deleteRequested" BOOLEAN DEFAULT false`,
      `ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "deleteRequestNote" VARCHAR(255)`,
    ];
    for (const sql of migrations) {
      try { await sequelize.query(sql); } catch (_) {}
    }
    console.log("✅ DB ready");
  })
  .catch(err => {
    console.error("❌ DB error:", err.message);
    throw err;
  });

// For Vercel: export a handler that waits for DB before each request
const handler = async (req, res) => {
  try {
    await dbInitPromise;
  } catch (err) {
    return res.status(500).json({ error: "DB connection failed", details: err.message });
  }
  app(req, res);
};

// For local: start server normally
if (!process.env.VERCEL) {
  dbInitPromise.then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
  });
}

module.exports = handler;
