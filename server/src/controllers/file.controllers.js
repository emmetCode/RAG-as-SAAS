import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Queue } from "bullmq";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import axios from "axios";
import { FILE } from "../models/file.models.js";
import path from "path";

const queue = new Queue("file-upload-queue", {
  connection: {
    url: "redis://redis:6379",
  },
});

// OCR.Space API key from environment variable
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;

// Use OCR.Space API to extract text from image URL
async function extractTextFromOCRSpace(url) {
  if (!OCR_SPACE_API_KEY) {
    throw new ApiError(500, "OCR.Space API key missing");
  }

  const formData = new URLSearchParams();
  formData.append("url", url);
  formData.append("apikey", OCR_SPACE_API_KEY);
  formData.append("OCREngine", "2");

  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("iscreatesearchablepdf", "true");

  const response = await axios.post(
    "https://api.ocr.space/parse/image",
    formData.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000, // 20 seconds timeout
    }
  );

  if (!response.data || response.data.IsErroredOnProcessing) {
    throw new ApiError(
      500,
      "OCR.Space processing failed: " +
        (response.data.ErrorMessage || "Unknown error")
    );
  }

  const parsedText = response.data.ParsedResults?.[0]?.ParsedText || "";
  return parsedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
const extractTextFromTxt = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "text" });
    return response.data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (err) {
    throw new ApiError(500, "Failed to extract text ", [err.message]);
  }
};

const extractTextFromPDF = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 10000,
    });

    const chunks = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const data = await pdfParse(buffer);

    const pages = data.text
      .split("\f")
      .filter((page) => page.trim().length > 0);
    return pages;
  } catch (err) {
    throw new ApiError(500, "Failed to extract text from PDF", [err.message]);
  }
};

const extractTextFromDocx = async (url) => {
  try {
    // Download docx file buffer from URL
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
    });
    const buffer = Buffer.from(response.data);

    const result = await mammoth.extractRawText({ buffer });
    return result.value
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  } catch (error) {
    throw new ApiError(500, "Failed to extract text from Docx", [err.message]);
  }
};

const extractTextFromImage = async (url) => {
  // Use OCR.Space on Image URL
  return extractTextFromOCRSpace(url);
};

const extractTextFromFile = async (file, url) => {
  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText;

  switch (ext) {
    case ".pdf":
      extractedText = await extractTextFromPDF(url);
      break;

    case ".docx":
      extractedText = await extractTextFromDocx(url);
      break;

    case ".txt":
      extractedText = await extractTextFromTxt(url);
      break;

    case ".png":
    case ".jpg":
    case ".jpeg":
      extractedText = await extractTextFromImage(url);
      break;

    default:
      throw new ApiError(415, `Unsupported file type: ${ext}`);
  }

  return extractedText;
};

const uploadMultiFileRAG = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files uploaded.");
  }

  const results = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"].includes(ext)) {
      results.push({
        filename: file.originalname,
        status: "failed",
        error: "Unsupported file format",
      });
      continue;
    }

    try {
      const uploadResult = await uploadOnCloudinary(file.path);
      const fileDoc = await FILE.create({
        Urls: [uploadResult.secure_url], // array of URLs even if just one PDF
      });

      if (!fileDoc) {
        throw new ApiError(400, "Failed to save PDF info to DB", []);
      }
      const extractedText = await extractTextFromFile(
        file,
        uploadResult.secure_url
      );

      await queue.add(
        "file-ready",
        {
          originalFilename: file.originalname,
          textChunks: extractedText,
          fileUrl: uploadResult.secure_url,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
        }
      );

      results.push({
        filename: file.originalname,
        status: "success",
        cloudinaryUrl: uploadResult.secure_url,
      });
    } catch (err) {
      results.push({
        filename: file.originalname,
        status: "failed",
        error: err.message,
      });
    }
  }

  return res
    .status(207)
    .json(
      new ApiResponse(207, { results }, "Multi-format file upload processed")
    );
});

export { uploadMultiFileRAG };
