import { embeddingsService } from "./backend/services/embeddingsService.js";
import dotenv from "dotenv";

dotenv.config();

async function testEmbeddings() {
  console.log("🧪 Testing Hugging Face Embeddings Service...\n");

  try {
    // Test 1: Get available models
    console.log("📋 Available Models:");
    const models = embeddingsService.getAvailableModels();
    models.forEach((model) => {
      console.log(`  - ${model.name}: ${model.description}`);
    });
    console.log("");

    // Test 2: Get current model
    console.log(`🔧 Current Model: ${embeddingsService.model}\n`);

    // Test 3: Generate embeddings
    const testTexts = [
      "Regulatory compliance requirements for pharmaceutical companies",
      "FDA guidelines for drug approval process",
      "Quality assurance standards in healthcare",
    ];

    console.log("🚀 Testing Embeddings Generation:");

    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      console.log(`\n  Text ${i + 1}: "${text}"`);

      const startTime = Date.now();
      const embedding = await embeddingsService.generateEmbeddings(text);
      const endTime = Date.now();

      console.log(`  ✅ Generated embedding in ${endTime - startTime}ms`);
      console.log(`  📏 Dimension: ${embedding.length}`);
      console.log(
        `  📊 Sample values: [${embedding
          .slice(0, 5)
          .map((v) => v.toFixed(4))
          .join(", ")}...]`
      );
    }

    // Test 4: Test model switching
    console.log("\n🔄 Testing Model Switching:");
    const newModel = "sentence-transformers/all-MiniLM-L12-v2";
    console.log(`  Switching to: ${newModel}`);
    embeddingsService.setModel(newModel);
    console.log(`  ✅ Current model: ${embeddingsService.model}`);

    // Test 5: Generate embedding with new model
    const testText = "Regulatory compliance documentation";
    console.log(`\n  Testing new model with: "${testText}"`);
    const newEmbedding = await embeddingsService.generateEmbeddings(testText);
    console.log(
      `  ✅ Generated embedding with dimension: ${newEmbedding.length}`
    );

    console.log(
      "\n🎉 All tests passed! Hugging Face embeddings service is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("  1. Make sure you have internet connection");
    console.log("  2. Check if the Hugging Face model is available");
    console.log("  3. Try with a different model if one fails");
    console.log("  4. The service will fallback to local embeddings if needed");
  }
}

// Run the test
testEmbeddings();
