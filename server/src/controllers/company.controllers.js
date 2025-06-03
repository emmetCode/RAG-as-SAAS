import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { COMPANY } from "../models/company.models.js";

export const companyRegistration = asyncHandler(async (req, res) => {
  const { allowedEmails, name } = req.body;

  if (
    !name ||
    !allowedEmails ||
    !Array.isArray(allowedEmails) ||
    !allowedEmails.some((email) => typeof email === "string" && email.includes("@"))
  ) {
    throw new ApiError(400, "Valid 'name' and at least one valid email in 'allowedEmails' are required.");
  }

  // Create the company
  const company = await COMPANY.create({
    allowedEmails: allowedEmails.map(email => email.toLowerCase()),
    name,
    adminUserId: req.user?._id,
  });

  if (!company) {
    throw new ApiError(500, "Failed to create the company.");
  }

  // Update the admin user with the new companyId
  await User.findByIdAndUpdate(req.user?._id, { companyId: company._id });

  return res
    .status(201)
    .json(new ApiResponse(201, company, "Successfully created the company and updated admin user."));
});
