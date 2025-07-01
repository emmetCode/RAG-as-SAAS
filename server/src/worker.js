import { Worker } from "bullmq";
import { CohereEmbeddings } from "@langchain/cohere";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as dotenv from "dotenv";
import { ApiError } from "./utils/ApiError.js";
import logger from "./logger/wiston.logger.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { UserRolesEnum } from "./constant.js";

dotenv.config({ path: "./.env" });

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    const {
      textChunks,
      originalFilename,
      userId,
      companyId,
      userRole,
      fileId,
    } = job.data;

    if (!textChunks || textChunks.length === 0) {
      throw new ApiError(400, "No text found in file");
    }

    const fullText = textChunks.join(" ").trim();
    if (!fullText) {
      throw new ApiError(400, "Extracted text is empty or invalid");
    }

    // 1. Chunk the document
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1100,
      chunkOverlap: 130,
    });

    const docs = await splitter.createDocuments(
      [fullText],
      [
        {
          metadata: {
            source: originalFilename || "unknown",
            userId,
            companyId: companyId || null,
            userRole: userRole || "UNKNOWN",
            uploadedAt: new Date().toISOString(),
            fileId: fileId || null,
          },
        },
      ]
    );

    // 2. Embedding using Cohere
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0",
    });

    // 3. Choose collection based on user role (multi-tenant aware)
    let collectionName;
    if (userRole === UserRolesEnum.ADMIN && companyId) {
      collectionName = `ragapp_company_${companyId}`;
    } else if (userRole === UserRolesEnum.NORMALUSER && userId) {
      collectionName = `ragapp_user_${userId}`;
    } else {
      throw new ApiError(
        400,
        "Invalid role or missing identifiers for vector storage"
      );
    }

    // 4. Store in Qdrant vector DB
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: "http://qdrant:6333",
      collectionName,
    });

    logger.info(
      ` ${originalFilename || "Document"} added to vector store in collection ${collectionName}`
    );
  },
  {
    concurrency: 10,
    connection: {
      url: "redis://redis:6379",
    },
  }
);

// Event handlers
worker.on("completed", (job) => {
  logger.info(` Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  logger.error(` Job ${job.id} failed: ${err.message}`, {
    stack: err.stack,
  });
});

// Graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down worker...");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
