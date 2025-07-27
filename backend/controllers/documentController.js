import Document from "../models/Document.js";
import { processDocument } from "../services/documentProcessor.js";
import { vectorService } from "../services/vectorService.js";
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
        )
      );
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, category = "Regulation" } = req.body;

    // Process the document
    const processedData = await processDocument(req.file);

    // Create document record
    const document = new Document({
      title: title || req.file.originalname,
      filename: req.file.originalname,
      category,
      content: processedData.content,
      chunks: processedData.chunks,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname),
    });

    await document.save();

    // Add document chunks to vector store
    try {
      await vectorService.addDocumentChunks(
        document._id.toString(),
        document.title,
        processedData.chunks
      );
    } catch (vectorError) {
      console.error("Vector storage error:", vectorError);
      // Continue with response even if vector storage fails
    }

    res.status(201).json({
      message: "Document uploaded and processed successfully",
      document: {
        id: document._id,
        title: document.title,
        category: document.category,
        uploadDate: document.uploadDate,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find(
      {},
      {
        title: 1,
        category: 1,
        uploadDate: 1,
        fileSize: 1,
        fileType: 1,
      }
    ).sort({ uploadDate: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from vector store first
    try {
      await vectorService.deleteDocumentChunks(id);
    } catch (vectorError) {
      console.error("Vector deletion error:", vectorError);
      // Continue with document deletion even if vector deletion fails
    }

    await Document.findByIdAndDelete(id);
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};
