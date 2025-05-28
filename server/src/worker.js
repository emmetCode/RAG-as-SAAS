import { Worker } from "bullmq";
import { CohereEmbeddings } from "@langchain/cohere";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as dotenv from "dotenv";
import { ApiError } from "./utils/ApiError.js";
import logger from "./logger/wiston.logger.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config({ path: "./.env" });

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    const { textChunks, originalFilename } = job.data;

    if (!textChunks || textChunks.length === 0) {
      throw new ApiError(400, "No text found in file", []);
    }

    const fullText = textChunks.join(" ").trim();

    if (!fullText) {
      throw new ApiError(400, "Extracted text is empty or invalid", []);
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
          },
        },
      ]
    );

    // 2. Create Embeddings
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0",
    });

    // 3. Store in Qdrant
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: "http://qdrant:6333",
      collectionName: "ragapp",
    });

    logger.info(`✅ ${originalFilename || "Document"} added to vector store`);
  },
  {
    concurrency: 10,
    connection: {
      url: "redis://redis:6379",
    },
  }
);

// Event listeners
worker.on("completed", (job) => {
  logger.info(`🎉 Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  logger.error(`🔥 Job ${job.id} failed: ${err.message}`, {
    stack: err.stack,
  });
});

// Graceful shutdown
const shutdown = async () => {
  logger.info("🛑 Shutting down worker...");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
