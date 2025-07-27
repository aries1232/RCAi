import express from "express";
import { hybridSearchService } from "../services/hybridSearchService.js";
import { findRelevantChunks } from "../services/searchService.js";

const router = express.Router();

// Get current search weights
router.get("/weights", async (req, res) => {
  try {
    const weights = hybridSearchService.getWeights();
    res.json({
      success: true,
      weights: weights,
      description: "Current hybrid search weights",
    });
  } catch (error) {
    console.error("Error getting search weights:", error);
    res.status(500).json({ error: "Failed to get search weights" });
  }
});

// Update search weights
router.post("/weights", async (req, res) => {
  try {
    const { vectorWeight, keywordWeight } = req.body;

    if (vectorWeight === undefined || keywordWeight === undefined) {
      return res.status(400).json({
        error: "Both vectorWeight and keywordWeight are required",
      });
    }

    hybridSearchService.setWeights(vectorWeight, keywordWeight);

    res.json({
      success: true,
      message: "Search weights updated successfully",
      weights: hybridSearchService.getWeights(),
    });
  } catch (error) {
    console.error("Error updating search weights:", error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze a query and get recommended weights
router.post("/analyze", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const analysis = await hybridSearchService.analyzeQuery(query);

    res.json({
      success: true,
      analysis: analysis,
    });
  } catch (error) {
    console.error("Error analyzing query:", error);
    res.status(500).json({ error: "Failed to analyze query" });
  }
});

// Test search with custom weights
router.post("/test", async (req, res) => {
  try {
    const { query, vectorWeight, keywordWeight, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Temporarily set custom weights
    const originalWeights = hybridSearchService.getWeights();

    if (vectorWeight !== undefined && keywordWeight !== undefined) {
      hybridSearchService.setWeights(vectorWeight, keywordWeight);
    }

    // Perform search
    const results = await findRelevantChunks(query, null, limit);

    // Restore original weights
    hybridSearchService.setWeights(
      originalWeights.vectorWeight,
      originalWeights.keywordWeight
    );

    res.json({
      success: true,
      query: query,
      weights: { vectorWeight, keywordWeight },
      results: results,
      resultCount: results.length,
    });
  } catch (error) {
    console.error("Error testing search:", error);
    res.status(500).json({ error: "Failed to test search" });
  }
});

// Get search statistics
router.get("/stats", async (req, res) => {
  try {
    const weights = hybridSearchService.getWeights();

    const stats = {
      currentWeights: weights,
      searchTypes: {
        hybrid: "Combines vector and keyword search",
        vector: "Semantic search using embeddings",
        keyword: "Text-based similarity search",
      },
      benefits: {
        vector: "Better semantic understanding, handles synonyms and context",
        keyword: "Precise term matching, faster for specific terms",
        hybrid: "Best of both worlds - semantic + precise matching",
      },
      recommendedUse: {
        technical:
          "Higher vector weight (0.8) for technical/regulatory queries",
        general: "Balanced weights (0.7/0.3) for general queries",
        specific: "Higher keyword weight (0.6) for specific term searches",
      },
    };

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Error getting search stats:", error);
    res.status(500).json({ error: "Failed to get search statistics" });
  }
});

// Reset to default weights
router.post("/reset", async (req, res) => {
  try {
    hybridSearchService.setWeights(0.7, 0.3);

    res.json({
      success: true,
      message: "Search weights reset to default (70% vector, 30% keyword)",
      weights: hybridSearchService.getWeights(),
    });
  } catch (error) {
    console.error("Error resetting search weights:", error);
    res.status(500).json({ error: "Failed to reset search weights" });
  }
});

export default router;
