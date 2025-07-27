import Document from "../models/Document.js";
import { vectorService } from "./vectorService.js";
import { hybridSearchService } from "./hybridSearchService.js";

// Hybrid search combining vector and keyword-based approaches
export const findRelevantChunks = async (query, documents, limit = 5) => {
  try {
    // Use hybrid search service for optimal results
    const relevantChunks = await hybridSearchService.findRelevantChunks(
      query,
      documents,
      limit
    );
    return relevantChunks;
  } catch (error) {
    console.error("Hybrid search service error:", error);

    // Fallback to vector search only
    try {
      const vectorResults = await vectorService.findRelevantChunks(
        query,
        limit
      );

      // Filter chunks to only include those from the specified documents
      if (documents && documents.length > 0) {
        const documentIds = documents.map((doc) => doc._id || doc.id);
        return vectorResults.filter((chunk) =>
          documentIds.includes(chunk.documentId)
        );
      }

      return vectorResults;
    } catch (vectorError) {
      console.error("Vector search fallback error:", vectorError);

      // Final fallback to text-based search
      return await fallbackTextSearch(query, documents, limit);
    }
  }
};

// Fallback text-based similarity search
const fallbackTextSearch = async (query, documents, limit = 5) => {
  try {
    const relevantChunks = [];

    for (const document of documents) {
      const chunks = document.chunks || [];

      for (const chunk of chunks) {
        const similarity = calculateTextSimilarity(
          query.toLowerCase(),
          chunk.text.toLowerCase()
        );

        if (similarity > 0.1) {
          // Threshold for relevance
          relevantChunks.push({
            documentId: document._id,
            documentTitle: document.title,
            text: chunk.text,
            similarity,
            metadata: chunk.metadata,
          });
        }
      }
    }

    // Sort by similarity and return top results
    return relevantChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
};

// Simple text similarity calculation (fallback method)
const calculateTextSimilarity = (query, text) => {
  const queryWords = query.split(/\s+/).filter((word) => word.length > 2);
  const textWords = text.split(/\s+/).map((word) => word.toLowerCase());

  let matches = 0;
  let totalWords = queryWords.length;

  for (const queryWord of queryWords) {
    if (
      textWords.some(
        (textWord) =>
          textWord.includes(queryWord) || queryWord.includes(textWord)
      )
    ) {
      matches++;
    }
  }

  return totalWords > 0 ? matches / totalWords : 0;
};

export const searchDocuments = async (query, category = null) => {
  try {
    const filter = category ? { category } : {};
    const documents = await Document.find(filter);

    const results = [];

    for (const document of documents) {
      const similarity = calculateTextSimilarity(
        query.toLowerCase(),
        document.content.toLowerCase()
      );

      if (similarity > 0.05) {
        results.push({
          document: {
            id: document._id,
            title: document.title,
            category: document.category,
          },
          similarity,
          preview: document.content.substring(0, 200) + "...",
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error("Document search error:", error);
    return [];
  }
};
