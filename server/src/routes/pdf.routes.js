import { Router } from "express";
import { uploadMultiFileRAG } from "../controllers/file.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/pdf").post(verifyJWT,upload.array('uploads', 5), uploadMultiFileRAG)

export default router;
