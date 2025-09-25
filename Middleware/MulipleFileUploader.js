const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    // prefer params if present (when used on /courses/:courseId/lessons/:lessonId/upload)
    const courseId = req.params.courseId || "general";
    const lessonId = req.params.lessonId || "general";
    const uploadPath = path.join(__dirname, "..", "uploads", courseId, lessonId);

    // ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }

})

const fileFilter = (req, file, cb) => {
  const field = file.fieldname;

  if (field === "videos") {
    if (file.mimetype.startsWith("video/")) return cb(null, true);
    return cb(new Error("Only video files allowed in 'videos' field"), false);
  }

  if (field === "pdfs") {
    if (file.mimetype === "application/pdf") return cb(null, true);
    return cb(new Error("Only PDF files allowed in 'pdfs' field"), false);
  }

  if (field === "images") {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files allowed in 'images' field"), false);
  }

  // for other materials we accept anything (or add more checks)
  if (field === "others") {
    return cb(null, true);
  }

  // default: reject unknown field
  return cb(new Error(`Unexpected field ${field}`), false);
};

const mutipleFileupload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4*1024 * 1024 * 1024 // 1 GB limit per file (adjust as needed)
  }
});

module.exports = {mutipleFileupload}