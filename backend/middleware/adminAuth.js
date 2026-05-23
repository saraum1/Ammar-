const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "يجب تسجيل الدخول" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "هذه الصفحة للإدارة فقط" });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "التوكن غير صالح" });
  }
};