# AI-Powered Regulatory Document Chatbot
NOTE : For the time being I have added .env so it is easy to test the working of the application. :)

Screenshots ->
![Screenshot 2025-06-08 105121](https://github.com/user-attachments/assets/25c18cfb-caa5-4098-ab6d-e849b28376b5)
![Screenshot 2025-06-08 105343](https://github.com/user-attachments/assets/3f84dc92-21d6-4707-997a-b7e81ea5122e)

![Screenshot 2025-06-08 084630](https://github.com/user-attachments/assets/c833aff2-ccc4-4809-8a3b-da65e707983f)
![Screenshot 2025-06-08 105318](https://github.com/user-attachments/assets/f9734608-cc6e-4be7-b48c-5936ec320706)
![Screenshot 2025-06-08 105546](https://github.com/user-attachments/assets/6905f795-3a32-4aae-b334-eddeeef003d6)

A comprehensive solution for Quality Assurance and Regulatory Affairs teams to quickly navigate and query regulatory documents using AI.

## Project Structure

```
regulatory-chatbot/
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js + Express.js backend
│   ├── config/        # Database and AI configuration
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── services/      # Business logic services
│   ├── middleware/    # Custom middleware
│   ├── package.json
│   └── index.js
└── package.json       # Root package.json for scripts
```

## 🚀 Features

- **Document Management**: Upload and manage PDF, DOCX, and TXT regulatory documents
- **AI-Powered Chat**: Conversational interface with context memory
- **Vector Embeddings**: Advanced semantic search using Hugging Face's free sentence-transformers models
- **ChromaDB Integration**: Efficient vector storage and similarity search
- **Multi-Document Selection**: Query across multiple documents simultaneously
- **Source Attribution**: Responses include references to source documents
- **Provider Flexibility**: Support for Mistral AI, Hugging Face, and offline models
- **Real-time Processing**: Instant document processing and chunking

## 📋 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- API keys for AI providers

### Installation

1. **Clone and Install Dependencies**:

   ```bash
   git clone <repository-url>
   cd regulatory-chatbot
   npm run install-all
   ```

2. **Configure Backend Environment**:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Add API Keys to backend/.env**:

   ```env
   MONGODB_URI=mongodb://localhost:27017/regulatory-chatbot
   MISTRAL_API_KEY=your_mistral_api_key_here
   HF_API_KEY=your_huggingface_api_key_here
   HF_EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
   CHROMADB_URL=http://localhost:8000
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the Application**:

   ```bash
   # From root directory
   npm run dev
   ```

   This will start:

   - Backend server on http://localhost:5000
   - Frontend application on http://localhost:5173

## 🔧 API Endpoints

### Documents

- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - Get all documents
- `DELETE /api/documents/:id` - Delete a document

### Chat

- `POST /api/chat/session` - Create a chat session
- `POST /api/chat/message` - Send a message
- `GET /api/chat/session/:sessionId` - Get chat history

### Embeddings

- `GET /api/embeddings/models` - Get available embedding models
- `POST /api/embeddings/models/change` - Change the current embedding model
- `POST /api/embeddings/test` - Test embeddings generation
- `GET /api/embeddings/status` - Get embeddings service status

### Search

- `GET /api/search/weights` - Get current hybrid search weights
- `POST /api/search/weights` - Update search weights
- `POST /api/search/analyze` - Analyze query and get recommended weights
- `POST /api/search/test` - Test search with custom weights
- `GET /api/search/stats` - Get search statistics and recommendations
- `POST /api/search/reset` - Reset to default weights

## 🤖 AI Provider Setup

### Mistral AI (Chat)

1. Sign up at [Mistral Console](https://console.mistral.ai/)
2. Generate an API key
3. Add to `backend/.env`: `MISTRAL_API_KEY=your_key_here`

### Hugging Face (Embeddings) - FREE!

1. **Option 1: No API Key Required (Recommended)**

   - Many models work without an API key
   - Just set `HF_EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2` in your `.env`

2. **Option 2: With API Key (Higher Rate Limits)**
   - Sign up at [Hugging Face](https://huggingface.co/)
   - Generate an API key at [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Add to `backend/.env`: `HF_API_KEY=your_key_here`

### ChromaDB (Vector Storage)

1. **Option 1: Docker (Recommended)**
   ```bash
   docker-compose up -d chromadb
   ```
2. **Option 2: Local Installation**
   ```bash
   pip install chromadb
   chroma run --host 0.0.0.0 --port 8000
   ```

### Offline Models (Future)

1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull mistral`
3. Start server: `ollama serve`

## 🏛️ Architecture

### Backend (MVC Pattern)

- **Models**: MongoDB schemas for documents and chat sessions
- **Views**: JSON API responses
- **Controllers**: Business logic for document and chat operations
- **Services**: AI integration and document processing

### Frontend (React.js)

- **Components**: Modular UI components
- **State Management**: React hooks for local state
- **API Integration**: Axios for backend communication
- **Styling**: Tailwind CSS for responsive design

## 📊 Document Processing

1. **Upload**: Files are uploaded via multipart form data
2. **Text Extraction**: PDF, DOCX, and TXT content extraction
3. **Chunking**: Documents split into overlapping chunks for better retrieval
4. **Storage**: Content and metadata stored in MongoDB
5. **Search**: Text-based similarity matching for relevant chunk retrieval

## 🔍 Search & Retrieval

- **Hybrid Search**: Combines 70% vector search and 30% keyword search for optimal results
- **Vector Embeddings**: Semantic search using Hugging Face's free sentence-transformers models
- **ChromaDB Storage**: Efficient vector database for similarity search
- **Context Aggregation**: Multiple document chunks combined for comprehensive answers
- **Source Attribution**: Responses linked back to original document sections
- **Adaptive Weights**: Automatically adjusts search weights based on query characteristics
- **Fallback Search**: Text-based similarity as backup when vector search fails
- **Model Flexibility**: Switch between different embedding models via API

## 🛡️ Security & Error Handling

- File type validation and size limits
- Comprehensive error handling with user-friendly messages
- Input sanitization and validation
- Graceful AI provider fallbacks

## 🚀 Production Deployment

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend

```bash
cd backend
npm start
# Deploy to your server with PM2 or similar
```

## 📈 Future Enhancements

- Multi-language support
- Advanced document analytics
- User authentication and authorization
- Document version control
- Audit trails and compliance reporting
- Hybrid search combining vector and keyword-based approaches
- Document similarity clustering
