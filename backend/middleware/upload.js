const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
fs.mkdirSync(path.join(__dirname, "../uploads/documents"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "../uploads/covers"),    { recursive: true });
fs.mkdirSync(path.join(__dirname, "../uploads/notes"),     { recursive: true });
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/documents")),
  filename:    (req, file, cb) => {
    const name = `cr_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("فقط ملفات PDF مسموح بها"), false);
};
exports.uploadPDF = multer({ storage: pdfStorage, fileFilter: pdfFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/covers")),
  filename:    (req, file, cb) => {
    const name = `cover_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
const imgFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("فقط الصور مسموح بها"), false);
};
exports.uploadImage = multer({ storage: imgStorage, fileFilter: imgFilter, limits: { fileSize: 3 * 1024 * 1024 } });
const noteImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/notes");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = `note_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
exports.uploadNoteImage = multer({ storage: noteImgStorage, fileFilter: imgFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/portfolio");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = `portfolio_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
exports.uploadPortfolioImage = multer({ storage: portfolioStorage, fileFilter: imgFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const productImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/products");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = `product_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
exports.uploadProductImage = multer({ storage: productImgStorage, fileFilter: imgFilter, limits: { fileSize: 5 * 1024 * 1024 } });