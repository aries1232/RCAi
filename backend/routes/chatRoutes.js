import express from 'express';
import { 
  createChatSession, 
  sendMessage, 
  getChatHistory 
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/session', createChatSession);
router.post('/message', sendMessage);
router.get('/session/:sessionId', getChatHistory);

export default router;