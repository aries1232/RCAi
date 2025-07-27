import express from "express";
import { embeddingsService } from "../services/embeddingsService.js";

const router = express.Router();

// Get available embedding models
router.get("/models", async (req, res) => {
  try {
    const models = embeddingsService.getAvailableModels();
    res.json({
      success: true,
      models: models,
      currentModel: embeddingsService.model,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// Change the current embedding model
router.post("/models/change", async (req, res) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({ error: "Model name is required" });
    }

    // Validate model name
    const availableModels = embeddingsService.getAvailableModels();
    const isValidModel = availableModels.some(
      (model) => model.url === modelName || model.name === modelName
    );

    if (!isValidModel) {
      return res.status(400).json({
        error: "Invalid model name",
        availableModels: availableModels.map((m) => ({
          name: m.name,
          url: m.url,
        })),
      });
    }

    // Set the new model
    embeddingsService.setModel(modelName);

    res.json({
      success: true,
      message: `Switched to model: ${modelName}`,
      currentModel: embeddingsService.model,
    });
  } catch (error) {
    console.error("Error changing model:", error);
    res.status(500).json({ error: "Failed to change model" });
  }
});

// Test embeddings generation
router.post("/test", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const embedding = await embeddingsService.generateEmbeddings(text);

    res.json({
      success: true,
      embedding: embedding,
      dimension: embedding.length,
      model: embeddingsService.model,
    });
  } catch (error) {
    console.error("Error testing embeddings:", error);
    res.status(500).json({ error: "Failed to generate embeddings" });
  }
});

// Get current embeddings service status
router.get("/status", async (req, res) => {
  try {
    res.json({
      success: true,
      currentModel: embeddingsService.model,
      hasApiKey: !!embeddingsService.apiKey,
      service: "Hugging Face Embeddings",
    });
  } catch (error) {
    console.error("Error getting status:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
});

export default router;
