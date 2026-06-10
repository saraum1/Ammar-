const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const os     = require("os");

// On Vercel use /tmp, otherwise use local uploads folder
const BASE_DIR = process.env.VERCEL === "1"
  ? os.tmpdir()
  : path.join(__dirname, "../uploads");

function ensureDir(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
}

ensureDir(path.join(BASE_DIR, "documents"));
ensureDir(path.join(BASE_DIR, "covers"));
ensureDir(path.join(BASE_DIR, "notes"));
ensureDir(path.join(BASE_DIR, "portfolio"));
ensureDir(path.join(BASE_DIR, "products"));

// PDF stored in memory so we can convert to base64 and save in DB (Vercel has no persistent disk)
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("فقط ملفات PDF مسموح بها"), false);
};
exports.uploadPDF = multer({ storage: multer.memoryStorage(), fileFilter: pdfFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const imgFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("فقط الصور مسموح بها"), false);
};

const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(BASE_DIR, "covers")),
  filename:    (req, file, cb) => cb(null, `cover_${Date.now()}${path.extname(file.originalname)}`)
});
exports.uploadImage = multer({ storage: imgStorage, fileFilter: imgFilter, limits: { fileSize: 3 * 1024 * 1024 } });

const noteImgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(BASE_DIR, "notes")),
  filename:    (req, file, cb) => cb(null, `note_${Date.now()}${path.extname(file.originalname)}`)
});
exports.uploadNoteImage = multer({ storage: noteImgStorage, fileFilter: imgFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(BASE_DIR, "portfolio")),
  filename:    (req, file, cb) => cb(null, `portfolio_${Date.now()}${path.extname(file.originalname)}`)
});
exports.uploadPortfolioImage = multer({ storage: portfolioStorage, fileFilter: imgFilter, limits: { fileSize: 8 * 1024 * 1024 } });

const productImgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(BASE_DIR, "products")),
  filename:    (req, file, cb) => cb(null, `product_${Date.now()}${path.extname(file.originalname)}`)
});
exports.uploadProductImage = multer({ storage: productImgStorage, fileFilter: imgFilter, limits: { fileSize: 5 * 1024 * 1024 } });
