import { Router } from "express";
import { uploadMultiFileRAG } from "../controllers/pdf.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/pdf").post(upload.array('uploads', 5), uploadMultiFileRAG)

export default router;
