import mongoose, { Schema } from "mongoose";
const pdfSchema = new mongoose.Schema(
  {
    pdfUrls: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Pdf = mongoose.model("pdf", pdfSchema);
