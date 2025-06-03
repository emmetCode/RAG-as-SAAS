import { ApiError } from "../utils/ApiError.js";
import { CohereEmbeddings } from "@langchain/cohere";
import { QdrantVectorStore } from "@langchain/qdrant";
import { CohereClient } from "cohere-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserRolesEnum } from "../constant.js";

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const chatSectionHandling = asyncHandler(async (req, res) => {
  const userQuery = req.query.message;
  const companyId = req.user?.companyId?.toString() || null;
  const userId = req.user?._id?.toString();
  const userRole = req.user?.role;

  if (!userQuery) {
    throw new ApiError(400, "User query is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized access - missing user context");
  }

  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
  });

  let collectionName;

  const companyRoles = [UserRolesEnum.ADMIN, UserRolesEnum.COMPANYMEMBER];

  if (companyId && companyRoles.includes(userRole)) {
    // Company users use company collection
    collectionName = `ragapp_company_${companyId}`;
  } else {
    // Normal users use user collection
    collectionName = `ragapp_user_${userId}`;
  }

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://qdrant:6333",
      collectionName,
    }
  );

  const retriever = vectorStore.asRetriever({
    k: 50,
  });

  // Retrieve docs from vector store
  const allResults = await retriever.invoke(userQuery);

  if (!allResults.length) {
    return res.json({
      message: "No relevant documents found for your query.",
      docs: [],
    });
  }

  // Manually filter docs by companyId or userId inside nested metadata
  let filteredResults = allResults.filter((doc) => {
    const md = doc.metadata?.metadata || {};
    if (companyId && companyRoles.includes(userRole)) {
      return md.companyId === companyId;
    } else {
      return md.userId === userId;
    }
  });

  if (!filteredResults.length) {
    return res.json({
      message: "No relevant documents found after metadata filtering.",
      docs: [],
    });
  }
  const isCompanyUser = companyId && companyRoles.includes(userRole);

  if (!isCompanyUser) {
    const validDocs = filteredResults.filter(
      (doc) =>
        doc.metadata?.metadata?.fileId && doc.metadata?.metadata?.uploadedAt
    );

    if (!validDocs.length) {
      return res.json({
        message: "No valid documents with uploadedAt and fileId found.",
        docs: [],
      });
    }

    const fileIdToLatestDate = {};

    validDocs.forEach((doc) => {
      const fileId = doc.metadata.metadata.fileId;
      const uploadedAt = new Date(doc.metadata.metadata.uploadedAt);

      if (
        !fileIdToLatestDate[fileId] ||
        fileIdToLatestDate[fileId] < uploadedAt
      ) {
        fileIdToLatestDate[fileId] = uploadedAt;
      }
    });

    const latestFileId = Object.entries(fileIdToLatestDate).sort(
      ([, dateA], [, dateB]) => dateB - dateA
    )[0][0];

    filteredResults = validDocs.filter(
      (doc) => doc.metadata.metadata.fileId === latestFileId
    );
  }

  const sanitizedResults = filteredResults.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: {
      source: doc.metadata.source,
    },
  }));

  const SYSTEM_PROMPT = `
You are a helpful AI Assistant who answers the user's query based on the context from uploaded documents.
Context:
${JSON.stringify(sanitizedResults)}
`;

  const chatResult = await cohere.chat({
    model: "command-r-plus",
    temperature: 0.5,
    message: userQuery,
    promptTruncation: "AUTO",
    chatHistory: [{ role: "SYSTEM", message: SYSTEM_PROMPT }],
  });

  return res.status(200).json({
    message: chatResult.text,
    docs: sanitizedResults,
  });
});

export { chatSectionHandling };
