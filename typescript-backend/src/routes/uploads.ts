// backend-ts/src/routes/uploads.ts
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/api/uploads", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file" });

  res.json({
    url: `/uploads/${file.filename}`,
    name: file.originalname,
    size: file.size
  });
});

export default router;
