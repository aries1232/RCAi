import { ChromaClient } from "chromadb";
import { embeddingsService } from "./embeddingsService.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMADB_URL || "http://localhost:8000",
});

const COLLECTION_NAME = "regulatory_documents";

export class VectorService {
  constructor() {
    this.collection = null;
    this.initializeCollection();
  }

  async initializeCollection() {
    try {
      // Try to get existing collection
      this.collection = await chromaClient.getCollection({
        name: COLLECTION_NAME,
      });
      console.log("Connected to existing ChromaDB collection");
    } catch (error) {
      // Create new collection if it doesn't exist
      try {
        this.collection = await chromaClient.createCollection({
          name: COLLECTION_NAME,
          metadata: {
            description: "Regulatory compliance document embeddings",
          },
        });
        console.log("Created new ChromaDB collection");
      } catch (createError) {
        console.error("Failed to create ChromaDB collection:", createError);
        throw createError;
      }
    }
  }

  async generateEmbeddings(text) {
    try {
      return await embeddingsService.generateEmbeddings(text);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error("Failed to generate embeddings");
    }
  }

  async addDocumentChunks(documentId, documentTitle, chunks) {
    try {
      if (!this.collection) {
        await this.initializeCollection();
      }

      const embeddings = [];
      const documents = [];
      const metadatas = [];
      const ids = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Generate embedding for the chunk
        const embedding = await this.generateEmbeddings(chunk.text);

        embeddings.push(embedding);
        documents.push(chunk.text);
        metadatas.push({
          documentId: documentId,
          documentTitle: documentTitle,
          chunkIndex: i,
          startIndex: chunk.metadata?.startIndex || 0,
          endIndex: chunk.metadata?.endIndex || 0,
        });
        ids.push(`${documentId}_chunk_${i}`);
      }

      // Add to ChromaDB collection
      await this.collection.add({
        embeddings: embeddings,
        documents: documents,
        metadatas: metadatas,
        ids: ids,
      });

      console.log(
        `Added ${chunks.length} chunks for document ${documentTitle}`
      );
    } catch (error) {
      console.error("Error adding document chunks to vector store:", error);
      throw error;
    }
  }

  async findRelevantChunks(query, limit = 5) {
    try {
      if (!this.collection) {
        await this.initializeCollection();
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbeddings(query);

      // Search for similar chunks
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        include: ["documents", "metadatas", "distances"],
      });

      // Transform results to match expected format
      const relevantChunks = results.documents[0].map((text, index) => ({
        documentId: results.metadatas[0][index].documentId,
        documentTitle: results.metadatas[0][index].documentTitle,
        text: text,
        similarity: 1 - results.distances[0][index], // Convert distance to similarity
        metadata: {
          chunkIndex: results.metadatas[0][index].chunkIndex,
          startIndex: results.metadatas[0][index].startIndex,
          endIndex: results.metadatas[0][index].endIndex,
        },
      }));

      return relevantChunks;
    } catch (error) {
      console.error("Error finding relevant chunks:", error);
      return [];
    }
  }

  async deleteDocumentChunks(documentId) {
    try {
      if (!this.collection) {
        await this.initializeCollection();
      }

      // Get all chunks for the document
      const results = await this.collection.get({
        where: { documentId: documentId },
      });

      if (results.ids.length > 0) {
        await this.collection.delete({
          ids: results.ids,
        });
        console.log(
          `Deleted ${results.ids.length} chunks for document ${documentId}`
        );
      }
    } catch (error) {
      console.error("Error deleting document chunks:", error);
      throw error;
    }
  }

  async updateDocumentChunks(documentId, documentTitle, chunks) {
    try {
      // Delete existing chunks
      await this.deleteDocumentChunks(documentId);

      // Add new chunks
      await this.addDocumentChunks(documentId, documentTitle, chunks);
    } catch (error) {
      console.error("Error updating document chunks:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const vectorService = new VectorService();
