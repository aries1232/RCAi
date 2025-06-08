import axios from 'axios';
import { aiConfig } from '../config/aiConfig.js';

let currentProvider = 'mistral';

export const generateResponse = async (userMessage, relevantChunks, chatHistory = []) => {
  try {
    // Prepare context from relevant chunks
    const context = relevantChunks.map(chunk => 
      `Document: ${chunk.documentTitle}\nContent: ${chunk.text}\n---`
    ).join('\n');

    // Prepare chat history for context
    const historyContext = chatHistory.slice(-6).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are a helpful AI assistant specialized in regulatory and compliance documentation. 
Your role is to answer questions based on the provided regulatory documents with accuracy and precision.

Guidelines:
- Always base your answers on the provided document context
- If information is not available in the documents, clearly state this
- Provide specific references to document sections when possible
- Maintain a professional and helpful tone
- For compliance-related questions, emphasize the importance of consulting with legal experts

Context from selected documents:
${context}

Previous conversation:
${historyContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Mistral API call
    const response = await axios.post(
      `${aiConfig.mistral.baseURL}/chat/completions`,
      {
        model: aiConfig.mistral.model,
        messages,
        temperature: 0.1,
        max_tokens: 1000
        // Add other fields from the docs if needed
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    const sources = relevantChunks.map(chunk => ({
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      relevantText: chunk.text.substring(0, 200) + '...',
      confidence: chunk.similarity || 0.8
    }));

    return {
      content: aiResponse,
      sources,
      provider: 'mistral'
    };
  } catch (error) {
    console.error('AI service error:', error);

    // Fallback response
    return {
      content: "I apologize, but I'm currently unable to process your request due to a technical issue. Please try again later or contact support if the problem persists.",
      sources: [],
      provider: 'fallback'
    };
  }
};

export const switchProvider = (provider) => {
  if (['mistral', 'offline'].includes(provider)) {
    currentProvider = provider;
    return true;
  }
  return false;
};

export const getAvailableProviders = () => {
  const providers = [];
  if (aiConfig.mistral.apiKey) providers.push('mistral');
  if (aiConfig.offline && aiConfig.offline.enabled) providers.push('offline');
  return providers;
};
