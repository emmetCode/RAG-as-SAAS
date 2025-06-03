import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true,
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowedEmails: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const COMPANY = mongoose.model("Company", companySchema);
