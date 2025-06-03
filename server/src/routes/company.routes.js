import { Router } from "express";
import { companyRegistration } from "../controllers/company.controllers.js";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constant.js";

const router = Router();
router
  .route("/register")
  .post(verifyJWT,verifyPermission([UserRolesEnum.ADMIN]), companyRegistration);

export default router;
