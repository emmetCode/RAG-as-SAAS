import mongoose, { Schema } from "mongoose";
const fileSchema = new mongoose.Schema(
  {
    Urls: [
      {
        type: String,
        required: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
  },
  { timestamps: true }
);

export const FILE = mongoose.model("file", fileSchema);
