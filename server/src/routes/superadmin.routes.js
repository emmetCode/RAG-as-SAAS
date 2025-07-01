import { Router } from "express";
import {companyAdminRegistration} from "../controllers/superAdmin.controllers.js"
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constant.js";

const router = Router();
router
  .route("/registerCompanyAdminEmail")
  .post(verifyJWT,verifyPermission([UserRolesEnum.SUPERADMIN]), companyAdminRegistration);

export default router;
