import mongoose, { Schema } from "mongoose";
const fileSchema = new mongoose.Schema(
  {
    Urls: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const FILE = mongoose.model("file", fileSchema);
