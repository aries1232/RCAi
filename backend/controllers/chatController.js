import ChatSession from '../models/ChatSession.js';
import Document from '../models/Document.js';
import { generateResponse } from '../services/aiService.js';
import { findRelevantChunks } from '../services/searchService.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';


//create a chat session 
export const createChatSession = async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    const documents = await Document.find({ _id: { $in: documentIds } });
    if (documents.length !== documentIds.length) {
      return res.status(400).json({ error: 'Some documents not found' });
    }

    const sessionId = uuidv4();
    const chatSession = new ChatSession({
      sessionId,
      selectedDocuments: documentIds,
      messages: []
    });

    await chatSession.save();
    
    res.status(201).json({
      sessionId,
      selectedDocuments: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        category: doc.category
      }))
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

//seng msg 
export const sendMessage = async (req, res) => {
  //console.log("djhf");
  try {
    const { sessionId, message } = req.body;
    
    // Find chat session
    const session = await ChatSession.findOne({ sessionId })
      .populate('selectedDocuments');
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Find relevant document chunks
    const relevantChunks = await findRelevantChunks(
      message, 
      session.selectedDocuments
    );

    // Generate AI response
    const aiResponse = await generateResponse(
      message,
      relevantChunks,
      session.messages
    );

    // Save user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Save AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      sources: aiResponse.sources
    });

    session.lastActivity = new Date();
    await session.save();

    res.json({
      response: aiResponse.content,
      sources: aiResponse.sources,
      messageId: session.messages[session.messages.length - 1]._id
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};


//get chat history
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({ sessionId })
      .populate('selectedDocuments', 'title category');
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      sessionId: session.sessionId,
      selectedDocuments: session.selectedDocuments,
      messages: session.messages,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};