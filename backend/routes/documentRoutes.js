import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  deleteDocument,
  upload 
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

export default router;