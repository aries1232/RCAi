import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"; // Free, lightweight model

export class EmbeddingsService {
  constructor() {
    this.model = process.env.HF_EMBEDDINGS_MODEL || DEFAULT_MODEL;
    this.apiKey = process.env.HF_API_KEY;
    this.baseURL = `${HF_API_URL}/${this.model}`;
  }

  async generateEmbeddings(text) {
    try {
      // Prepare the request
      const payload = {
        inputs: text,
        options: {
          wait_for_model: true,
        },
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // Add API key if available (optional for some models)
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      // Make request to Hugging Face API
      const response = await axios.post(this.baseURL, payload, { headers });

      if (response.data && Array.isArray(response.data)) {
        // Return the embedding vector
        return response.data[0];
      } else if (response.data && response.data.embeddings) {
        // Alternative response format
        return response.data.embeddings[0];
      } else {
        throw new Error("Unexpected response format from Hugging Face API");
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);

      // If API key is not provided or model is not available, use fallback
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.log("Falling back to local embeddings generation...");
        return await this.generateLocalEmbeddings(text);
      }

      throw new Error("Failed to generate embeddings");
    }
  }

  async generateLocalEmbeddings(text) {
    try {
      // Simple TF-IDF based embedding as fallback
      // This is a basic implementation - in production you might want to use a proper local model
      const words = text
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);
      const wordFreq = {};

      // Calculate word frequencies
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      // Create a simple vector representation
      const uniqueWords = Object.keys(wordFreq);
      const vector = new Array(384).fill(0); // Match the dimension of all-MiniLM-L6-v2

      uniqueWords.forEach((word, index) => {
        if (index < vector.length) {
          vector[index] = wordFreq[word] / words.length; // Normalized frequency
        }
      });

      return vector;
    } catch (error) {
      console.error("Error generating local embeddings:", error);
      throw new Error("Failed to generate local embeddings");
    }
  }

  async generateBatchEmbeddings(texts) {
    try {
      const embeddings = [];

      for (const text of texts) {
        const embedding = await this.generateEmbeddings(text);
        embeddings.push(embedding);
      }

      return embeddings;
    } catch (error) {
      console.error("Error generating batch embeddings:", error);
      throw error;
    }
  }

  // Get available models for embeddings
  getAvailableModels() {
    return [
      {
        name: "all-MiniLM-L6-v2",
        description: "Fast, lightweight model (384 dimensions)",
        url: "sentence-transformers/all-MiniLM-L6-v2",
      },
      {
        name: "all-mpnet-base-v2",
        description: "High quality model (768 dimensions)",
        url: "sentence-transformers/all-mpnet-base-v2",
      },
      {
        name: "all-MiniLM-L12-v2",
        description: "Balanced model (384 dimensions)",
        url: "sentence-transformers/all-MiniLM-L12-v2",
      },
    ];
  }

  // Change the model being used
  setModel(modelName) {
    this.model = modelName;
    this.baseURL = `${HF_API_URL}/${this.model}`;
    console.log(`Switched to model: ${this.model}`);
  }
}

// Export singleton instance
export const embeddingsService = new EmbeddingsService();
