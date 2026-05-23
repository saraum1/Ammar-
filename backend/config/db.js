const { Sequelize } = require("sequelize");
require("pg"); // explicitly include pg for Vercel bundler

let sequelize;

if (process.env.DATABASE_URL) {
  // Render / production: use full connection URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development
  sequelize = new Sequelize(
    process.env.DB_NAME || "emaar_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "12343",
    {
      host:    process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: false,
    }
  );
}

module.exports = sequelize;
