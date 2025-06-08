//import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const processDocument = async (file) => {
  let content = '';
  
  try {
    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      content = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value;
    } else if (file.mimetype === 'text/plain') {
      content = file.buffer.toString('utf-8');
    }

    // Split content into chunks for better retrieval
    const chunks = createChunks(content);
    
    return {
      content,
      chunks: chunks.map((chunk, index) => ({
        text: chunk.text,
        metadata: {
          chunkIndex: index,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex
        }
      }))
    };
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error('Failed to process document');
  }
};

const createChunks = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let startIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '.';
    
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length
      });
      
      // Create overlap
      const overlapText = currentChunk.slice(-overlap);
      startIndex += currentChunk.length - overlap;
      currentChunk = overlapText + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      startIndex,
      endIndex: startIndex + currentChunk.length
    });
  }
  
  return chunks;
};