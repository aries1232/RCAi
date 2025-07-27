import { hybridSearchService } from "./backend/services/hybridSearchService.js";
import dotenv from "dotenv";

dotenv.config();

async function testHybridSearch() {
  console.log("🧪 Testing Hybrid Search Service (70% Vector + 30% Keyword)\n");

  try {
    // Test 1: Get current weights
    console.log("📊 Current Search Weights:");
    const weights = hybridSearchService.getWeights();
    console.log(`  Vector Weight: ${weights.vectorWeight * 100}%`);
    console.log(`  Keyword Weight: ${weights.keywordWeight * 100}%\n`);

    // Test 2: Query analysis
    const testQueries = [
      "FDA compliance requirements",
      "clinical trial protocol",
      "quality assurance standards",
      "documentation guidelines",
      "regulatory approval process",
    ];

    console.log("🔍 Query Analysis:");
    for (const query of testQueries) {
      const analysis = await hybridSearchService.analyzeQuery(query);
      console.log(`\n  Query: "${query}"`);
      console.log(`    Word Count: ${analysis.wordCount}`);
      console.log(`    Has Technical Terms: ${analysis.hasTechnicalTerms}`);
      console.log(`    Has Regulatory Terms: ${analysis.hasRegulatoryTerms}`);
      console.log(
        `    Recommended Weights: Vector=${
          analysis.recommendedWeight.vectorWeight * 100
        }%, Keyword=${analysis.recommendedWeight.keywordWeight * 100}%`
      );
    }

    // Test 3: Weight adjustment
    console.log("\n⚖️ Testing Weight Adjustment:");

    // Test different weight configurations
    const weightConfigs = [
      { name: "Vector-Heavy", vector: 0.8, keyword: 0.2 },
      { name: "Balanced", vector: 0.7, keyword: 0.3 },
      { name: "Keyword-Heavy", vector: 0.4, keyword: 0.6 },
    ];

    for (const config of weightConfigs) {
      console.log(`\n  Testing ${config.name} configuration:`);
      hybridSearchService.setWeights(config.vector, config.keyword);
      const currentWeights = hybridSearchService.getWeights();
      console.log(
        `    Current weights: Vector=${
          currentWeights.vectorWeight * 100
        }%, Keyword=${currentWeights.keywordWeight * 100}%`
      );
    }

    // Reset to default
    hybridSearchService.setWeights(0.7, 0.3);
    console.log("\n  ✅ Reset to default weights (70% vector, 30% keyword)");

    // Test 4: Performance comparison
    console.log("\n🚀 Performance Comparison:");
    const testQuery = "regulatory compliance documentation requirements";

    console.log(`\n  Test Query: "${testQuery}"`);

    // Test with different weights
    const testWeights = [
      { name: "Vector Only", vector: 1.0, keyword: 0.0 },
      { name: "Hybrid (70/30)", vector: 0.7, keyword: 0.3 },
      { name: "Keyword Only", vector: 0.0, keyword: 1.0 },
    ];

    for (const weightConfig of testWeights) {
      console.log(`\n    ${weightConfig.name}:`);
      hybridSearchService.setWeights(weightConfig.vector, weightConfig.keyword);

      const startTime = Date.now();
      // Note: This would need actual documents to test with
      // const results = await hybridSearchService.findRelevantChunks(testQuery, documents, 5);
      const endTime = Date.now();

      console.log(
        `      Configuration: Vector=${weightConfig.vector * 100}%, Keyword=${
          weightConfig.keyword * 100
        }%`
      );
      console.log(`      Response time: ${endTime - startTime}ms (simulated)`);
    }

    // Test 5: Adaptive weights
    console.log("\n🎯 Adaptive Weight Recommendations:");
    const adaptiveQueries = [
      "FDA", // Short query - should favor keyword
      "What are the FDA compliance requirements for pharmaceutical companies in clinical trials?", // Long technical query - should favor vector
      "quality assurance", // Medium query with technical terms
      "documentation", // Short general query
    ];

    for (const query of adaptiveQueries) {
      const analysis = await hybridSearchService.analyzeQuery(query);
      console.log(`\n  Query: "${query}"`);
      console.log(
        `    Recommended: Vector=${
          analysis.recommendedWeight.vectorWeight * 100
        }%, Keyword=${analysis.recommendedWeight.keywordWeight * 100}%`
      );
      console.log(
        `    Reasoning: ${analysis.wordCount} words, Technical: ${analysis.hasTechnicalTerms}, Regulatory: ${analysis.hasRegulatoryTerms}`
      );
    }

    console.log("\n🎉 Hybrid search testing completed successfully!");
    console.log("\n💡 Key Benefits:");
    console.log(
      "  • Combines semantic understanding (vector) with precise matching (keyword)"
    );
    console.log("  • Adapts weights based on query characteristics");
    console.log("  • Provides fallback mechanisms for reliability");
    console.log("  • Configurable weights for different use cases");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("  1. Ensure all services are running");
    console.log("  2. Check environment variables");
    console.log("  3. Verify document processing is working");
  }
}

// Run the test
testHybridSearch();
