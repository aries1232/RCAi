import { vectorService } from "./vectorService.js";
import { calculateTextSimilarity } from "./searchService.js";

export class HybridSearchService {
  constructor() {
    this.vectorWeight = 0.7; // 70% vector search
    this.keywordWeight = 0.3; // 30% keyword search
  }

  async findRelevantChunks(query, documents, limit = 5) {
    try {
      // Get vector search results
      const vectorResults = await this.performVectorSearch(
        query,
        documents,
        limit * 2
      );

      // Get keyword search results
      const keywordResults = await this.performKeywordSearch(
        query,
        documents,
        limit * 2
      );

      // Combine and rank results
      const combinedResults = this.combineAndRankResults(
        vectorResults,
        keywordResults,
        query,
        limit
      );

      return combinedResults;
    } catch (error) {
      console.error("Hybrid search error:", error);

      // Fallback to vector search only
      try {
        return await vectorService.findRelevantChunks(query, limit);
      } catch (vectorError) {
        console.error("Vector search fallback failed:", vectorError);
        return [];
      }
    }
  }

  async performVectorSearch(query, documents, limit) {
    try {
      const vectorResults = await vectorService.findRelevantChunks(
        query,
        limit
      );

      // Filter by specified documents if provided
      if (documents && documents.length > 0) {
        const documentIds = documents.map((doc) => doc._id || doc.id);
        return vectorResults.filter((result) =>
          documentIds.includes(result.documentId)
        );
      }

      return vectorResults;
    } catch (error) {
      console.error("Vector search error:", error);
      return [];
    }
  }

  async performKeywordSearch(query, documents, limit) {
    try {
      const keywordResults = [];

      for (const document of documents) {
        const chunks = document.chunks || [];

        for (const chunk of chunks) {
          const similarity = calculateTextSimilarity(
            query.toLowerCase(),
            chunk.text.toLowerCase()
          );

          if (similarity > 0.1) {
            // Threshold for relevance
            keywordResults.push({
              documentId: document._id,
              documentTitle: document.title,
              text: chunk.text,
              similarity: similarity,
              metadata: chunk.metadata,
              searchType: "keyword",
            });
          }
        }
      }

      // Sort by similarity and return top results
      return keywordResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error("Keyword search error:", error);
      return [];
    }
  }

  combineAndRankResults(vectorResults, keywordResults, query, limit) {
    const combinedMap = new Map();

    // Process vector results with 70% weight
    vectorResults.forEach((result) => {
      const key = `${result.documentId}_${result.metadata?.chunkIndex || 0}`;
      const weightedScore = result.similarity * this.vectorWeight;

      combinedMap.set(key, {
        ...result,
        combinedScore: weightedScore,
        vectorScore: result.similarity,
        keywordScore: 0,
        searchType: "vector",
      });
    });

    // Process keyword results with 30% weight
    keywordResults.forEach((result) => {
      const key = `${result.documentId}_${result.metadata?.chunkIndex || 0}`;
      const weightedScore = result.similarity * this.keywordWeight;

      if (combinedMap.has(key)) {
        // Update existing entry
        const existing = combinedMap.get(key);
        existing.combinedScore += weightedScore;
        existing.keywordScore = result.similarity;
        existing.searchType = "hybrid";
      } else {
        // Add new entry
        combinedMap.set(key, {
          ...result,
          combinedScore: weightedScore,
          vectorScore: 0,
          keywordScore: result.similarity,
          searchType: "keyword",
        });
      }
    });

    // Convert to array and sort by combined score
    const combinedResults = Array.from(combinedMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);

    // Normalize similarity scores for final output
    return combinedResults.map((result) => ({
      documentId: result.documentId,
      documentTitle: result.documentTitle,
      text: result.text,
      similarity: result.combinedScore,
      metadata: result.metadata,
      searchType: result.searchType,
      vectorScore: result.vectorScore,
      keywordScore: result.keywordScore,
    }));
  }

  // Adjust search weights dynamically
  setWeights(vectorWeight, keywordWeight) {
    if (vectorWeight + keywordWeight !== 1) {
      throw new Error("Weights must sum to 1");
    }
    this.vectorWeight = vectorWeight;
    this.keywordWeight = keywordWeight;
    console.log(
      `Updated search weights: Vector=${vectorWeight}, Keyword=${keywordWeight}`
    );
  }

  // Get current search weights
  getWeights() {
    return {
      vectorWeight: this.vectorWeight,
      keywordWeight: this.keywordWeight,
    };
  }

  // Perform semantic similarity analysis
  async analyzeQuery(query) {
    const analysis = {
      query: query,
      wordCount: query.split(/\s+/).length,
      hasTechnicalTerms: this.hasTechnicalTerms(query),
      hasRegulatoryTerms: this.hasRegulatoryTerms(query),
      recommendedWeight: this.getRecommendedWeight(query),
    };

    return analysis;
  }

  hasTechnicalTerms(query) {
    const technicalTerms = [
      "compliance",
      "regulation",
      "fda",
      "approval",
      "clinical",
      "trial",
      "documentation",
      "quality",
      "assurance",
      "validation",
      "verification",
      "protocol",
      "standard",
      "requirement",
      "guideline",
      "policy",
    ];

    return technicalTerms.some((term) =>
      query.toLowerCase().includes(term.toLowerCase())
    );
  }

  hasRegulatoryTerms(query) {
    const regulatoryTerms = [
      "regulatory",
      "compliance",
      "fda",
      "ema",
      "who",
      "guidance",
      "regulation",
      "standard",
      "requirement",
      "approval",
      "submission",
      "inspection",
      "audit",
      "certification",
      "accreditation",
    ];

    return regulatoryTerms.some((term) =>
      query.toLowerCase().includes(term.toLowerCase())
    );
  }

  getRecommendedWeight(query) {
    const wordCount = query.split(/\s+/).length;
    const hasTechnical = this.hasTechnicalTerms(query);
    const hasRegulatory = this.hasRegulatoryTerms(query);

    // For technical/regulatory queries, favor vector search
    if (hasTechnical || hasRegulatory) {
      return { vectorWeight: 0.8, keywordWeight: 0.2 };
    }

    // For short queries, favor keyword search
    if (wordCount <= 2) {
      return { vectorWeight: 0.4, keywordWeight: 0.6 };
    }

    // For long queries, favor vector search
    if (wordCount >= 8) {
      return { vectorWeight: 0.8, keywordWeight: 0.2 };
    }

    // Default weights
    return { vectorWeight: 0.7, keywordWeight: 0.3 };
  }
}

// Export singleton instance
export const hybridSearchService = new HybridSearchService();
