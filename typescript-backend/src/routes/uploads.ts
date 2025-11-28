// backend-ts/src/routes/uploads.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ensure uploads/ exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/api/uploads", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  return res.json({
    url: `/uploads/${file.filename}`,
    name: file.originalname,
    size: file.size,
  });
});

export default router;
