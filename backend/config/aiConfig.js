// AI Configuration for chat and embeddings
export const aiConfig = {
  useOffline: false, // Set to true to use offline model
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: "https://api.mistral.ai/v1",
    model: "mistral-medium",
  },
  huggingface: {
    apiKey: process.env.HF_API_KEY, // Optional for some models
    embeddingsModel:
      process.env.HF_EMBEDDINGS_MODEL ||
      "sentence-transformers/all-MiniLM-L6-v2",
  },
  offline: {
    enabled: false, // Set to true if you have an offline model running
    endpoint: "http://localhost:11434",
    model: "mistral-7b",
  },
  chromadb: {
    url: process.env.CHROMADB_URL || "http://localhost:8000",
    collectionName: "regulatory_documents",
  },
};

// Returns config for the selected AI mode
export const getAIConfig = () => {
  return aiConfig.useOffline ? aiConfig.offline : aiConfig.mistral;
};
