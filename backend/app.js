const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173"] : true,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB readiness middleware (set by server.js)
app.use((req, res, next) => {
  if (app.get("dbError")) {
    return res.status(500).json({ error: "DB connection failed", details: app.get("dbError") });
  }
  next();
});

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/projects",  require("./routes/projects"));
app.use("/api/companies", require("./routes/companies"));
app.use("/api/requests",  require("./routes/requests"));
app.use("/api/admin",     require("./routes/admin"));
app.use("/api/notes",         require("./routes/notes"));
app.use("/api/reviews",       require("./routes/reviews"));
app.use("/api/products",      require("./routes/products"));
app.use("/api/orders",        require("./routes/orders"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/meetings",      require("./routes/meetings"));
app.use("/api/favorites",     require("./routes/favorites"));
app.use("/api/portfolio",     require("./routes/portfolio"));

module.exports = app;
