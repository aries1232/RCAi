import Document from '../models/Document.js';

// Simple text-based similarity search
// In production, you'd use vector embeddings with services like Pinecone or Weaviate
export const findRelevantChunks = async (query, documents, limit = 5) => {
  try {
    const relevantChunks = [];
    
    for (const document of documents) {
      const chunks = document.chunks || [];
      
      for (const chunk of chunks) {
        const similarity = calculateTextSimilarity(query.toLowerCase(), chunk.text.toLowerCase());
        
        if (similarity > 0.1) { // Threshold for relevance
          relevantChunks.push({
            documentId: document._id,
            documentTitle: document.title,
            text: chunk.text,
            similarity,
            metadata: chunk.metadata
          });
        }
      }
    }
    
    // Sort by similarity and return top results
    return relevantChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error('Search service error:', error);
    return [];
  }
};

// Simple text similarity calculation
// In production, use more sophisticated methods like TF-IDF or embeddings
const calculateTextSimilarity = (query, text) => {
  const queryWords = query.split(/\s+/).filter(word => word.length > 2);
  const textWords = text.split(/\s+/).map(word => word.toLowerCase());
  
  let matches = 0;
  let totalWords = queryWords.length;
  
  for (const queryWord of queryWords) {
    if (textWords.some(textWord => 
      textWord.includes(queryWord) || queryWord.includes(textWord)
    )) {
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
            category: document.category
          },
          similarity,
          preview: document.content.substring(0, 200) + '...'
        });
      }
    }
    
    return results.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Document search error:', error);
    return [];
  }
};