import mongoose, { Schema } from "mongoose";
const AllowedCompanyAdminSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // superadmin who added this email
  createdAt: { type: Date, default: Date.now },
});

export const AllowedCompanyAdmin = mongoose.model(
  "AllowedCompanyAdmin",
  AllowedCompanyAdminSchema
);
