# AI-Powered Regulatory Document Chatbot
NOTE : For the time being I have added .env so it is easy to test the working of the application. :)


Screenshots ->
![Screenshot 2025-06-08 105121](https://github.com/user-attachments/assets/25c18cfb-caa5-4098-ab6d-e849b28376b5)
![Screenshot 2025-06-08 105343](https://github.com/user-attachments/assets/3f84dc92-21d6-4707-997a-b7e81ea5122e)
 
![Screenshot 2025-06-08 084630](https://github.com/user-attachments/assets/c833aff2-ccc4-4809-8a3b-da65e707983f)
![Screenshot 2025-06-08 105318](https://github.com/user-attachments/assets/f9734608-cc6e-4be7-b48c-5936ec320706)
![Screenshot 2025-06-08 105546](https://github.com/user-attachments/assets/6905f795-3a32-4aae-b334-eddeeef003d6)


A comprehensive solution for Quality Assurance and Regulatory Affairs teams to quickly navigate and query regulatory documents using AI.

##  Project Structure

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
- **Multi-Document Selection**: Query across multiple documents simultaneously
- **Source Attribution**: Responses include references to source documents
- **Provider Flexibility**: Support for Mistral AI, OpenAI, and offline models
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

## 🤖 AI Provider Setup

### Mistral AI
1. Sign up at [Mistral Console](https://console.mistral.ai/)
2. Generate an API key
3. Add to `backend/.env`: `MISTRAL_API_KEY=your_key_here`

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

- **Text Similarity**: Keyword-based matching with relevance scoring
- **Context Aggregation**: Multiple document chunks combined for comprehensive answers
- **Source Attribution**: Responses linked back to original document sections

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

- Vector embeddings for improved semantic search
- Multi-language support
- Advanced document analytics
- User authentication and authorization
- Document version control
- Audit trails and compliance reporting

