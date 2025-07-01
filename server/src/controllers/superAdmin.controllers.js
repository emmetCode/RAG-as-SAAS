import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AllowedCompanyAdmin } from "../models/superadmin.models.js";

export const companyAdminRegistration = asyncHandler(async (req, res) => {
  const { allowedEmails } = req.body;

  const existing = await AllowedCompanyAdmin.findOne({ email: allowedEmails });
  if (existing) {
    throw new ApiError(404, "Companyadmin emails already exists");
  }

  const allowedAdmin = await AllowedCompanyAdmin.create({
    email: allowedEmails,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        allowedAdmin,
        "Successfully created the company admin email !!!."
      )
    );
});
