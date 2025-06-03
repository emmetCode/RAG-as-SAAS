import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {chatSectionHandling } from "../controllers/chat.controllers.js"
const router = Router();

router.route("/chat").get(verifyJWT,chatSectionHandling)
export default router;